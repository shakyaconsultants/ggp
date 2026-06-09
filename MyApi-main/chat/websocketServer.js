const WebSocket = require("ws");
const {
  authNutritionistChat,
  authClientChat,
  createMessage,
  markMessagesRead,
  roomKey,
} = require("../common/chatService");

function initChatWebSocket(server, app) {
  const wss = new WebSocket.Server({ server, path: "/ws/chat" });
  const rooms = new Map();

  function getRoom(key) {
    if (!rooms.has(key)) rooms.set(key, new Set());
    return rooms.get(key);
  }

  function leaveRoom(ws) {
    if (!ws.roomKey) return;
    getRoom(ws.roomKey).delete(ws);
    ws.roomKey = null;
  }

  function joinRoom(ws, key) {
    leaveRoom(ws);
    ws.roomKey = key;
    getRoom(key).add(ws);
  }

  function send(ws, payload) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }

  function broadcastToRoom(nid, cid, payload) {
    for (const peer of getRoom(roomKey(nid, cid))) {
      send(peer, payload);
    }
  }

  function broadcastMessage(message) {
    broadcastToRoom(message.nutritionist_id, message.client_id, {
      type: "message",
      message,
    });
  }

  function broadcastReadReceipts(nutritionistId, clientId, readerRole, receipts) {
    if (!receipts?.length) return;
    broadcastToRoom(nutritionistId, clientId, {
      type: "read_receipt",
      reader: readerRole,
      receipts,
    });
  }

  async function handleMarkRead(ws) {
    if (!ws.session) return;
    const { nutritionistId, clientId, role } = ws.session;
    const receipts = await markMessagesRead(nutritionistId, clientId, role);
    broadcastReadReceipts(nutritionistId, clientId, role, receipts);
    return receipts;
  }

  app.locals.broadcastChatMessage = broadcastMessage;
  app.locals.broadcastChatReadReceipts = broadcastReadReceipts;

  wss.on("connection", (ws) => {
    ws.session = null;

    ws.on("message", async (raw) => {
      let msg;
      try {
        msg = JSON.parse(String(raw));
      } catch {
        send(ws, { type: "error", message: "Invalid JSON" });
        return;
      }

      try {
        if (msg.type === "auth") {
          const token = msg.token;
          let session;

          if (msg.role === "nutritionist") {
            if (!msg.nutritionistId || !msg.clientId) {
              send(ws, { type: "error", message: "nutritionistId and clientId required" });
              return;
            }
            session = await authNutritionistChat(
              token,
              msg.nutritionistId,
              msg.clientId
            );
          } else if (msg.role === "client") {
            session = await authClientChat(token);
          } else {
            send(ws, { type: "error", message: "role must be nutritionist or client" });
            return;
          }

          ws.session = session;
          joinRoom(ws, roomKey(session.nutritionistId, session.clientId));
          send(ws, {
            type: "auth_ok",
            nutritionistId: session.nutritionistId,
            clientId: session.clientId,
            role: session.role,
          });
          await handleMarkRead(ws);
          return;
        }

        if (!ws.session) {
          send(ws, { type: "error", message: "Authenticate first" });
          return;
        }

        if (msg.type === "read") {
          await handleMarkRead(ws);
          return;
        }

        if (msg.type === "send") {
          const { nutritionistId, clientId, role, userId } = ws.session;
          const message = await createMessage({
            nutritionistId,
            clientId,
            senderType: role,
            senderId: userId,
            body: msg.text ?? msg.body,
          });

          broadcastMessage(message);
          return;
        }

        send(ws, { type: "error", message: "Unknown message type" });
      } catch (err) {
        send(ws, {
          type: "error",
          message: err.message || "Request failed",
        });
      }
    });

    ws.on("close", () => leaveRoom(ws));
  });

  console.log("✓ Chat WebSocket listening on /ws/chat");
  return wss;
}

module.exports = { initChatWebSocket };
