import React, { useEffect, useRef, useState } from "react";

function Chat() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "m1",
      sender: "them",
      text: "Hey! Is the item still available for pickup today?",
    },
    {
      id: "m2",
      sender: "me",
      text: "Yes! I can meet around 4pm. Want to coordinate in chat?",
    },
  ]);

  const [enterId, setEnterId] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;

    const newId = `m_${Date.now()}`;
    const next = [
      ...messages,
      {
        id: newId,
        sender: "me",
        text,
      },
    ];

    setMessages(next);
    setDraft("");
    setEnterId(newId);

    window.setTimeout(() => {
      setEnterId((current) => (current === newId ? null : current));
    }, 450);
  };

  return (
    <section className="page-section">
      <div className="section-head">
        <p className="eyebrow">Campus Chat</p>
        <h2>Connect with verified classmates</h2>
        <p>Keep conversations on-platform for safety and convenience.</p>
      </div>

      <div className="page-panel" aria-label="Chat thread">
        <div className="chat-messages" role="log" aria-live="polite">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`chat-message ${m.sender} ${
                m.id === enterId ? "chat-message--enter" : ""
              }`}
            >
              <div className="chat-bubble">{m.text}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="chat-composer">
          <input
            className="input-control"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            aria-label="Type a message"
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button
            type="button"
            className="btn primary"
            onClick={sendMessage}
            disabled={!draft.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}

export default Chat;