import conversationService from '../services/conversationService.js';
import logger from '../utils/logger.js';

/**
 * Maps userId → Set<socketId> for presence tracking (simple in-memory).
 */
const userSockets = new Map();

/**
 * Register all chat-related socket event handlers.
 *
 * @param {import('socket.io').Server} io
 */
export const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    const { userId } = socket;
    logger.info({ socketId: socket.id, userId }, 'Socket connected');

    // Track user connection
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Join the user to their personal room so we can send targeted events
    // (e.g., conversation:new when a booking is approved)
    socket.join(`user:${userId}`);

    // ── conversation:join ──────────────────────────────────────────
    socket.on('conversation:join', async ({ conversationId }, callback) => {
      try {
        if (!conversationId || typeof conversationId !== 'string') {
          return callback?.({ error: 'INVALID_INPUT', message: 'conversationId is required.' });
        }

        // Verify user is a participant
        const isParticipant = await conversationService.isParticipant(conversationId, userId);
        if (!isParticipant) {
          return callback?.({ error: 'NOT_AUTHORIZED', message: 'You are not a participant in this conversation.' });
        }

        await socket.join(`conv:${conversationId}`);
        logger.debug({ userId, conversationId }, 'User joined conversation room');
        callback?.({ success: true });
      } catch (err) {
        logger.error({ err, userId, conversationId }, 'Error joining conversation');
        callback?.({ error: 'INTERNAL_ERROR', message: 'Failed to join conversation.' });
      }
    });

    // ── conversation:leave ─────────────────────────────────────────
    socket.on('conversation:leave', ({ conversationId }, callback) => {
      if (!conversationId) {
        return callback?.({ error: 'INVALID_INPUT', message: 'conversationId is required.' });
      }
      socket.leave(`conv:${conversationId}`);
      callback?.({ success: true });
    });

    // ── message:send ───────────────────────────────────────────────
    socket.on('message:send', async ({ conversationId, content }, callback) => {
      try {
        if (!conversationId || !content) {
          return callback?.({ error: 'INVALID_INPUT', message: 'conversationId and content are required.' });
        }

        if (typeof content !== 'string' || content.trim().length === 0) {
          return callback?.({ error: 'INVALID_INPUT', message: 'Message content cannot be empty.' });
        }

        if (content.length > 5000) {
          return callback?.({ error: 'MESSAGE_TOO_LONG', message: 'Message exceeds 5000 character limit.' });
        }

        // Verify user is a participant
        const isParticipant = await conversationService.isParticipant(conversationId, userId);
        if (!isParticipant) {
          return callback?.({ error: 'NOT_AUTHORIZED', message: 'You are not a participant in this conversation.' });
        }

        const message = await conversationService.sendMessage({
          conversationId,
          senderId: userId,
          content: content.trim()
        });

        // Broadcast to all participants in the room (including sender for optimistic UI)
        io.to(`conv:${conversationId}`).emit('message:new', message);
        callback?.({ success: true, data: message });
      } catch (err) {
        logger.error({ err, userId, conversationId }, 'Error sending message');
        callback?.({ error: 'INTERNAL_ERROR', message: 'Failed to send message.' });
      }
    });

    // ── disconnect ─────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, userId, reason }, 'Socket disconnected');

      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });
};

/**
 * Check if a user has any active socket connections.
 * Utility for REST API presence lookups.
 */
export const isUserOnline = (userId) => {
  return userSockets.has(userId) && userSockets.get(userId).size > 0;
};
