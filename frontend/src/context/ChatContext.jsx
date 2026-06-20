import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api.js';
import { connectSocket, disconnectSocket, onChatEvent, offChatEvent } from '../services/chat.js';
import { useAuth } from './AuthContext.jsx';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  // Use refs to avoid stale closures in socket event handlers
  const activeConversationIdRef = useRef(activeConversationId);
  activeConversationIdRef.current = activeConversationId;

  // Connect/disconnect socket based on auth state
  useEffect(() => {
    if (user && token) {
      connectSocket(token);
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user, token]);

  // Fetch conversations
  const refreshConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.getMyConversations();
      if (res.success) {
        const convs = res.data || [];
        setConversations(convs);
        // Build unread counts map
        const counts = {};
        convs.forEach((c) => {
          counts[c.id] = c.unreadCount || 0;
        });
        setUnreadCounts(counts);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  }, [user]);

  // Use ref for refreshConversations to avoid stale closure
  const refreshConversationsRef = useRef(refreshConversations);
  refreshConversationsRef.current = refreshConversations;

  // Load conversations on mount and when user changes
  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Listen for socket events - stable handlers via refs
  useEffect(() => {
    const handleNewMessage = (message) => {
      if (message.conversationId === activeConversationIdRef.current) {
        setMessages((prev) => [...prev, message]);
      } else {
        // If not the active conversation, increment unread counter
        setUnreadCounts((prev) => ({
          ...prev,
          [message.conversationId]: (prev[message.conversationId] || 0) + 1
        }));
      }
      refreshConversationsRef.current();
    };

    const handleNewConversation = (conversation) => {
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === conversation.id);
        if (exists) return prev;
        return [conversation, ...prev];
      });
    };

    const handleUnread = ({ conversationId, count }) => {
      setUnreadCounts((prev) => ({
        ...prev,
        [conversationId]: count
      }));
    };

    const handleError = (error) => {
      console.error('[Chat] Socket error:', error.message);
    };

    onChatEvent('message:new', handleNewMessage);
    onChatEvent('conversation:new', handleNewConversation);
    onChatEvent('unread', handleUnread);
    onChatEvent('error', handleError);

    return () => {
      offChatEvent('message:new');
      offChatEvent('conversation:new');
      offChatEvent('unread');
      offChatEvent('error');
    };
  }, []);

  // Fetch messages for a conversation
  const loadMessages = useCallback(async (conversationId, cursor = null) => {
    if (!conversationId) return;
    setIsLoading(true);
    try {
      const res = await api.getConversationMessages(conversationId, cursor);
      if (res.success) {
        const newMessages = res.data || [];
        if (cursor) {
          setMessages((prev) => [...newMessages, ...prev]);
        } else {
          setMessages(newMessages);
        }
        setHasMore(res.hasMore || false);
        setNextCursor(res.nextCursor || null);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Select a conversation and mark it as read
  const selectConversation = useCallback(async (conversationId) => {
    setActiveConversationId(conversationId);
    setMessages([]);
    setNextCursor(null);
    setHasMore(false);

    if (conversationId) {
      // Mark conversation as read via API
      try {
        await api.markConversationRead(conversationId);
        setUnreadCounts((prev) => ({
          ...prev,
          [conversationId]: 0
        }));
      } catch (err) {
        console.error('Failed to mark conversation as read:', err);
      }

      await loadMessages(conversationId);
    }
  }, [loadMessages]);

  // Load older messages
  const loadOlderMessages = useCallback(() => {
    if (activeConversationId && hasMore && nextCursor) {
      loadMessages(activeConversationId, nextCursor);
    }
  }, [activeConversationId, hasMore, nextCursor, loadMessages]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

  const value = useMemo(
    () => ({
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
    }),
    [
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
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
