import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "../context/ChatContext.jsx";
import { sendMessage, joinConversation, leaveConversation } from "../services/chat.js";

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

function Chat() {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    isLoading,
    hasMore,
    unreadCounts,
    selectConversation,
    loadOlderMessages,
    refreshConversations
  } = useChat();

  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const threadRef = useRef(null);
  const joinedRef = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (activeConversationId) {
      joinedRef.current = true;
      joinConversation(activeConversationId).catch((err) => {
        console.error("Failed to join conversation:", err);
      });
    }

    return () => {
      if (activeConversationId && joinedRef.current) {
        leaveConversation(activeConversationId).catch(() => {});
        joinedRef.current = false;
      }
    };
  }, [activeConversationId]);

  const handleScroll = useCallback(() => {
    if (!threadRef.current || !hasMore || isLoading) return;
    const { scrollTop } = threadRef.current;
    if (scrollTop < 100) {
      loadOlderMessages();
    }
  }, [hasMore, isLoading, loadOlderMessages]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !activeConversationId || sending) return;

    setSending(true);
    try {
      await sendMessage(activeConversationId, text);
      setDraft("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelect = (conversationId) => {
    selectConversation(conversationId);
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!search) return true;
    const name = conv.otherUser?.fullName?.toLowerCase() || "";
    const title = conv.booking?.listing?.title?.toLowerCase() || "";
    const q = search.toLowerCase();
    return name.includes(q) || title.includes(q);
  });

  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = null;
    for (const msg of messages) {
      const msgDate = formatDate(msg.createdAt);
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ type: "date", label: msgDate });
      }
      groups.push({ type: "message", data: msg });
    }
    return groups;
  }, [messages]);

  return (
    <section className="chat-layout" aria-label="Chat area">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-head">
          <div>
            <p className="eyebrow">Messages</p>
            <h3>Campus Chat</h3>
          </div>
        </div>
        <div className="chat-search">
          <input
            type="text"
            placeholder="Search conversations..."
            aria-label="Search conversations"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="chat-list">
          {filteredConversations.length === 0 ? (
            <div className="chat-empty">
              {search
                ? "No conversations match your search."
                : "No conversations yet. Start a booking to begin chatting."}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const lastMsg = conv.lastMessage;
              const preview = lastMsg
                ? lastMsg.content.length > 42
                  ? `${lastMsg.content.slice(0, 42)}...`
                  : lastMsg.content
                : "No messages yet";
              const otherUser = conv.otherUser;
              const unread = unreadCounts[conv.id] || 0;

              return (
                <button
                  key={conv.id}
                  type="button"
                  className={`chat-list-item ${conv.id === activeConversationId ? "active" : ""}`}
                  onClick={() => handleSelect(conv.id)}
                >
                  <span className="chat-avatar">
                    {otherUser?.fullName?.[0] || "?"}
                  </span>
                  <div className="chat-list-meta">
                    <strong>{otherUser?.fullName || "Unknown User"}</strong>
                    <span className="chat-list-preview">{preview}</span>
                  </div>
                  <div className="chat-list-right">
                    {unread > 0 && (
                      <span className="chat-unread-badge">{unread}</span>
                    )}
                    {conv.booking?.listing?.title && (
                      <span className="chat-list-item-label" title={conv.booking.listing.title}>
                        {conv.booking.listing.title}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <div className="chat-main">
        <header className="chat-header">
          {activeConversation ? (
            <div className="chat-user">
              <span className="chat-avatar large">
                {activeConversation.otherUser?.fullName?.[0] || "?"}
              </span>
              <div>
                <strong>{activeConversation.otherUser?.fullName || "Unknown User"}</strong>
                {activeConversation.booking?.listing?.title && (
                  <span className="chat-status">
                    Renting: {activeConversation.booking.listing.title}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="chat-user">
              <div>
                <strong>No conversation selected</strong>
              </div>
            </div>
          )}
        </header>

        <div
          className="chat-thread"
          ref={threadRef}
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
        >
          {isLoading && messages.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>
              Loading messages...
            </div>
          )}

          {hasMore && (
            <div style={{ textAlign: "center", padding: "10px" }}>
              <button
                type="button"
                className="chat-link"
                onClick={loadOlderMessages}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load older messages"}
              </button>
            </div>
          )}

          {!isLoading && messages.length === 0 && activeConversation && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}

          {groupedMessages.map((item, idx) =>
            item.type === "date" ? (
              <div key={`date-${idx}`} className="chat-day">
                {item.label}
              </div>
            ) : (
              <div
                key={item.data.id}
                className={`chat-message ${item.data.senderId === activeConversation?.otherUser?.id ? "incoming" : "outgoing"}`}
              >
                <div className="chat-bubble">
                  <p>{item.data.content}</p>
                  <span className="chat-time">{formatTime(item.data.createdAt)}</span>
                </div>
              </div>
            )
          )}

          <div ref={endRef} />
        </div>

        <footer className="chat-input-area">
          <input
            type="text"
            placeholder="Type a message..."
            aria-label="Message input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!activeConversationId || sending}
          />
          <button
            type="button"
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!draft.trim() || !activeConversationId || sending}
            aria-label="Send message"
          >
            {sending ? "..." : "Send"}
          </button>
        </footer>
      </div>
    </section>
  );
}

export default Chat;
