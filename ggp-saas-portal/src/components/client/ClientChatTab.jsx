import { useEffect, useRef, useState } from "react";
import { formatChatTime } from "../../utils/chatWs";
import { isMessageReadByClient, useClientChat } from "../../hooks/useClientChat";

export default function ClientChatTab({ nutritionistId, clientId, clientName }) {
  const { messages, loading, connected, sending, error, sendMessage } = useClientChat(
    nutritionistId,
    clientId
  );
  const [draft, setDraft] = useState("");
  const threadRef = useRef(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    const ok = await sendMessage(text);
    if (ok) setDraft("");
  }

  return (
    <div className="client-tab-panel">
      <div className="client-chat-shell card panel">
        <header className="client-chat-head">
          <div>
            <h3>Messages</h3>
            <p className="muted">
              Chat with {clientName || "your client"} — synced with the mobile app.
            </p>
          </div>
          <span
            className={`client-chat-status ${connected ? "client-chat-status--live" : ""}`}
          >
            {connected ? "Live" : "Connecting…"}
          </span>
        </header>

        {error && (
          <p className="client-chat-error" role="alert">
            {error}
          </p>
        )}

        <div
          className="client-chat-thread"
          ref={threadRef}
          aria-label="Conversation"
        >
          {loading ? (
            <p className="muted client-chat-empty">Loading messages…</p>
          ) : messages.length === 0 ? (
            <p className="muted client-chat-empty">
              No messages yet. Say hello to {clientName || "your client"}.
            </p>
          ) : (
            messages.map((msg) => {
              const isNutritionist = msg.sender_type === "nutritionist";
              const read = isNutritionist && isMessageReadByClient(msg);
              return (
                <div
                  key={msg.id}
                  className={`client-chat-bubble client-chat-bubble--${
                    isNutritionist ? "nutritionist" : "client"
                  }`}
                >
                  <p>{msg.body}</p>
                  <div className="client-chat-bubble-foot">
                    <time className="client-chat-time" dateTime={msg.created_at}>
                      {formatChatTime(msg.created_at)}
                    </time>
                    {isNutritionist && (
                      <span
                        className={`client-chat-read${read ? " client-chat-read--seen" : ""}`}
                        title={read ? "Read by client" : "Sent"}
                      >
                        {read ? "Read" : "Sent"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form className="client-chat-compose" onSubmit={handleSubmit}>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            aria-label="Message"
            disabled={sending}
            maxLength={4000}
          />
          <button type="submit" className="btn btn-primary" disabled={sending || !draft.trim()}>
            {sending ? "Sending…" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
