import { useCallback, useEffect, useRef, useState } from "react";
import { api, getToken } from "../api/client";
import { getChatWsUrl } from "../utils/chatWs";

function applyReadReceipts(messages, receipts) {
  if (!receipts?.length) return messages;
  const map = new Map(receipts.map((r) => [r.id, r]));
  return messages.map((m) => {
    const patch = map.get(m.id);
    if (!patch) return m;
    return {
      ...m,
      read_by_nutritionist_at: patch.read_by_nutritionist_at ?? m.read_by_nutritionist_at,
      read_by_client_at: patch.read_by_client_at ?? m.read_by_client_at,
    };
  });
}

export function useClientChat(nutritionistId, clientId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  const mergeMessage = useCallback((message) => {
    if (!message?.id) return;
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) {
        return prev.map((m) => (m.id === message.id ? { ...m, ...message } : m));
      }
      return [...prev, message].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at) || a.id - b.id
      );
    });
  }, []);

  const applyReceipts = useCallback((receipts) => {
    setMessages((prev) => applyReadReceipts(prev, receipts));
  }, []);

  const markRead = useCallback(async () => {
    if (!nutritionistId || !clientId) return;
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "read" }));
        return;
      }
      const data = await api.markChatRead(nutritionistId, clientId);
      applyReceipts(data.receipts);
    } catch {
      /* non-blocking */
    }
  }, [nutritionistId, clientId, applyReceipts]);

  const loadHistory = useCallback(async () => {
    if (!nutritionistId || !clientId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.chatMessages(nutritionistId, clientId);
      const list = Array.isArray(data.messages) ? data.messages : [];
      setMessages(list);
      await markRead();
    } catch (e) {
      setError(e.message || "Could not load messages");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [nutritionistId, clientId, markRead]);

  const connect = useCallback(() => {
    if (!nutritionistId || !clientId) return;

    const token = getToken();
    if (!token) {
      setError("Not logged in");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(getChatWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "auth",
          role: "nutritionist",
          token,
          nutritionistId: Number(nutritionistId),
          clientId: Number(clientId),
        })
      );
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (data.type === "auth_ok") {
        setConnected(true);
        setError(null);
        return;
      }

      if (data.type === "message" && data.message) {
        mergeMessage(data.message);
        if (data.message.sender_type === "client") {
          ws.send(JSON.stringify({ type: "read" }));
        }
        return;
      }

      if (data.type === "read_receipt") {
        applyReceipts(data.receipts);
        return;
      }

      if (data.type === "error") {
        setError(data.message || "Chat error");
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      reconnectRef.current = window.setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      setConnected(false);
    };
  }, [nutritionistId, clientId, mergeMessage, applyReceipts]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  const sendMessage = useCallback(
    async (text) => {
      const body = String(text || "").trim();
      if (!body) return false;

      setSending(true);
      setError(null);

      try {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "send", text: body }));
          setSending(false);
          return true;
        }

        const data = await api.sendChatMessage(nutritionistId, clientId, body);
        if (data.message) mergeMessage(data.message);
        setSending(false);
        return true;
      } catch (e) {
        setError(e.message || "Failed to send");
        setSending(false);
        return false;
      }
    },
    [nutritionistId, clientId, mergeMessage]
  );

  return {
    messages,
    loading,
    connected,
    sending,
    error,
    sendMessage,
    reload: loadHistory,
  };
}

export function isMessageReadByClient(message) {
  return Boolean(message?.read_by_client_at);
}
