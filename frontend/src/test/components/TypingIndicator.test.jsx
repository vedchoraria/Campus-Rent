import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { ChatProvider, useChat } from '../../context/ChatContext.jsx';
import { AuthContext } from '../../context/AuthContext.jsx';
import { BrowserRouter } from 'react-router-dom';
import { api } from '../../services/api.js';

// Store socket 'on' callbacks so tests can simulate events
let socketOnCallbacks = {};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn((event, cb) => {
      socketOnCallbacks[event] = cb;
    }),
    emit: vi.fn((event, data, callback) => {
      if (callback) callback({ success: true, data: { id: 'msg-1' } });
    }),
    connected: true,
    id: 'mock-socket-id',
    disconnect: vi.fn(),
  })),
}));

vi.mock('../../services/api.js', () => ({
  api: {
    getMyConversations: vi.fn(),
    getConversationMessages: vi.fn(),
    markConversationRead: vi.fn(),
  },
}));

const mockUser = { id: 'user-1', fullName: 'Test User' };
const mockToken = 'test-token';
const mockOtherUserId = 'user-2';

const renderWithProviders = (ui, { user = mockUser, token = mockToken } = {}) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={{ user, token, login: vi.fn(), logout: vi.fn() }}>
        <ChatProvider>
          {ui}
        </ChatProvider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

function TypingConsumer() {
  const chat = useChat();
  const isOtherTyping = chat.activeConversationId && chat.typingUsers[chat.activeConversationId];

  return (
    <div>
      <div data-testid="typing-users">{JSON.stringify(chat.typingUsers)}</div>
      <div data-testid="active-conversation-id">{chat.activeConversationId || 'none'}</div>
      {isOtherTyping && (
        <div data-testid="typing-indicator">
          {chat.activeConversation?.otherUser?.fullName || 'User'} is typing...
        </div>
      )}
      <button
        data-testid="select-conv"
        onClick={() => chat.selectConversation('conv-1')}
      >
        Select Conv 1
      </button>
    </div>
  );
}

describe('Typing Indicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    socketOnCallbacks = {};
    api.getMyConversations.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'conv-1',
          bookingId: 'booking-1',
          otherUser: { id: mockOtherUserId, fullName: 'Other User' },
          lastMessage: { content: 'Hello!', createdAt: new Date().toISOString(), senderId: mockOtherUserId },
          unreadCount: 0,
        },
      ],
    });
    api.getConversationMessages.mockResolvedValue({
      success: true,
      data: [],
      hasMore: false,
      nextCursor: null,
    });
    api.markConversationRead.mockResolvedValue({
      success: true,
      data: { unreadCount: 0 },
    });
  });

  it('should show typing indicator when typing:update isTyping=true is received', async () => {
    renderWithProviders(<TypingConsumer />);

    await waitFor(() => {
      expect(api.getMyConversations).toHaveBeenCalled();
    });

    // Select conversation first
    const selectBtn = screen.getByTestId('select-conv');
    await act(async () => {
      fireEvent.click(selectBtn);
    });

    // Simulate receiving typing:update with isTyping=true via the socket callback
    await act(async () => {
      socketOnCallbacks['typing:update']({ conversationId: 'conv-1', userId: mockOtherUserId, isTyping: true });
    });

    // Indicator should appear
    await waitFor(() => {
      expect(screen.getByTestId('typing-indicator')).toBeDefined();
    });
    expect(screen.getByTestId('typing-indicator').textContent).toContain('is typing...');
  });

  it('should hide typing indicator when typing:update isTyping=false is received', async () => {
    renderWithProviders(<TypingConsumer />);

    await waitFor(() => {
      expect(api.getMyConversations).toHaveBeenCalled();
    });

    const selectBtn = screen.getByTestId('select-conv');
    await act(async () => {
      fireEvent.click(selectBtn);
    });

    // Show typing
    await act(async () => {
      socketOnCallbacks['typing:update']({ conversationId: 'conv-1', userId: mockOtherUserId, isTyping: true });
    });
    expect(screen.getByTestId('typing-indicator')).toBeDefined();

    // Hide typing
    await act(async () => {
      socketOnCallbacks['typing:update']({ conversationId: 'conv-1', userId: mockOtherUserId, isTyping: false });
    });

    await waitFor(() => {
      expect(screen.queryByTestId('typing-indicator')).toBeNull();
    });
  });

  it('should NOT show typing indicator when typingUsers is empty', async () => {
    renderWithProviders(<TypingConsumer />);

    await waitFor(() => {
      expect(api.getMyConversations).toHaveBeenCalled();
    });

    const indicator = screen.queryByTestId('typing-indicator');
    expect(indicator).toBeNull();
  });

  it('should track typingUsers as an object', async () => {
    renderWithProviders(<TypingConsumer />);

    await waitFor(() => {
      expect(api.getMyConversations).toHaveBeenCalled();
    });

    const el = screen.getByTestId('typing-users');
    const users = JSON.parse(el.textContent);
    expect(typeof users).toBe('object');
  });

  it('should have emitTypingStart function', async () => {
    const { emitTypingStart } = await import('../../services/chat.js');
    expect(emitTypingStart).toBeDefined();
    expect(typeof emitTypingStart).toBe('function');
  });

  it('should have emitTypingStop function', async () => {
    const { emitTypingStop } = await import('../../services/chat.js');
    expect(emitTypingStop).toBeDefined();
    expect(typeof emitTypingStop).toBe('function');
  });
});
