import React, { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "campusrent_chat_state";

const contacts = [];

const getInitialState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        activeId: null,
        threads: {},
        unread: {},
      };
    }

    const parsed = JSON.parse(stored);
    return {
      activeId: parsed.activeId || null,
      threads: parsed.threads || {},
      unread: parsed.unread || {},
    };
  } catch (error) {
    return {
      activeId: null,
      threads: {},
      unread: {},
    };
  }
};

const getLastPreview = (thread) => {
  if (!thread || thread.length === 0) return "No messages yet";
  const last = thread[thread.length - 1].text || "";
  return last.length > 42 ? `${last.slice(0, 42)}...` : last;
};

function Chat() {
  const initial = useMemo(() => getInitialState(), []);
  const [activeId, setActiveId] = useState(initial.activeId);
  const [threads, setThreads] = useState(initial.threads);
  const [unread, setUnread] = useState(initial.unread);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");

  const activeContact = useMemo(
    () => contacts.find((contact) => contact.id === activeId) || null,
    [activeId]
  );

  const [enterId, setEnterId] = useState(null);
  const endRef = useRef(null);

  const activeMessages = (activeId && threads[activeId]) || [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeMessages]);

  useEffect(() => {
    const payload = JSON.stringify({ activeId, threads, unread });
    localStorage.setItem(STORAGE_KEY, payload);
  }, [activeId, threads, unread]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || !activeId) return;

    const newId = `m_${Date.now()}`;
    const next = [
      ...activeMessages,
      {
        id: newId,
        sender: "me",
        text,
      },
    ];

    setThreads((prev) => ({
      ...prev,
      [activeId]: next,
    }));
    setDraft("");
    setEnterId(newId);

    window.setTimeout(() => {
      setEnterId((current) => (current === newId ? null : current));
    }, 450);
  };

  const handleSelect = (contactId) => {
    setActiveId(contactId);
    setUnread((prev) => ({
      ...prev,
      [contactId]: 0,
    }));
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="chat-layout" aria-label="Chat area">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-head">
          <div>
            <p className="eyebrow">Messages</p>
            <h3>Campus Chat</h3>
          </div>
          <button className="chat-action" type="button" aria-label="New message">
            +
          </button>
        </div>
        <div className="chat-search">
          <input
            type="text"
            placeholder="Search conversations..."
            aria-label="Search conversations"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="chat-list">
          {filteredContacts.length === 0 ? (
            <div className="chat-empty">No conversations yet. Start a booking to begin chatting.</div>
          ) : (
            filteredContacts.map((contact) => {
              const preview = getLastPreview(threads[contact.id]);
              const unreadCount = unread[contact.id] || 0;

              return (
                <button
                  key={contact.id}
                  type="button"
                  className={`chat-list-item ${
                    contact.id === activeId ? "active" : ""
                  }`}
                  onClick={() => handleSelect(contact.id)}
                >
                  <span className="chat-avatar">{contact.name[0]}</span>
                  <div className="chat-list-meta">
                    <strong>{contact.name}</strong>
                    <span className="chat-list-preview">{preview}</span>
                  </div>
                  {unreadCount > 0 ? (
                    <span className="chat-unread">{unreadCount}</span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </aside>

      <div className="chat-main">
        <header className="chat-header">
          {activeContact ? (
            <div className="chat-user">
              <span className="chat-avatar large">
                {activeContact.name[0]}
              </span>
              <div>
                <strong>{activeContact.name}</strong>
                <span className="chat-status">{activeContact.status}</span>
              </div>
            </div>
          ) : (
            <div className="chat-user">
              <div>
                <strong>No conversation selected</strong>
              </div>
            </div>
          )}
          <div className="chat-header-actions">
            <button type="button" aria-label="Call">
              Call
            </button>
            <button type="button" aria-label="More options">
              More
            </button>
          </div>
        </header>

        <div className="chat-thread" role="log" aria-live="polite">
          <div className="chat-day">Today</div>
          {activeMessages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
              <p>No messages yet. Select a conversation to start chatting.</p>
            </div>
          )}
          {activeMessages.map((m) => (
            <div
              key={m.id}
              className={`chat-message ${m.sender} ${
                m.id === enterId ? "chat-message--enter" : ""
              }`}
            >
              <div className="chat-bubble">{m.text}</div>
            </div>
          ))}
          {activeContact && <div className="chat-pill">{activeContact.badge}</div>}
          <div ref={endRef} />
        </div>

        <div className="chat-input">
          <button type="button" className="chat-attach" aria-label="Add attachment">
            +
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your message..."
            aria-label="Type a message"
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button
            type="button"
            className="chat-send"
            onClick={sendMessage}
            disabled={!draft.trim() || !activeId}
          >
            Send
          </button>
        </div>
      </div>

      <aside className="chat-aside">
        <div className="chat-card">
          <h4>Safe Meetup Tips</h4>
          <ol className="chat-tip-list">
            <li>Meet in public, high-traffic campus locations.</li>
            <li>Share your meeting time and place with a friend.</li>
            <li>Inspect the item before finalizing the exchange.</li>
            <li>Use in-app payments when possible.</li>
          </ol>
          <button className="chat-link" type="button">
            Read Safety Guide
          </button>
        </div>
      </aside>
    </section>
  );
}

export default Chat;
