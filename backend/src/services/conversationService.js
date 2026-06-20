import prisma from '../utils/prismaClient.js';
import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';

class ConversationError extends AppError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.name = 'ConversationError';
  }
}

/**
 * Auto-create a conversation when a booking is approved.
 * Accepts an optional transaction client (tx) for when called within
 * an existing Prisma transaction to avoid nested transaction issues.
 */
export const createConversationForBooking = async (bookingId, ownerId, borrowerId, tx) => {
  const client = tx || prisma;

  // Check if a conversation already exists (idempotency)
  const existing = await client.conversation.findUnique({
    where: { bookingId }
  });
  if (existing) {
    return existing;
  }

  const conversation = await client.conversation.create({
    data: {
      bookingId,
      participants: {
        create: [
          { userId: ownerId },
          { userId: borrowerId }
        ]
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              collegeEmail: true,
              profileImage: true,
              department: true
            }
          }
        }
      },
      booking: {
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              images: { orderBy: { displayOrder: 'asc' }, take: 1 }
            }
          }
        }
      }
    }
  });

  logger.info({ bookingId, conversationId: conversation.id }, 'Conversation auto-created on booking approval');
  return conversation;
};

export const getMyConversations = async (userId) => {
  const participants = await prisma.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  collegeEmail: true,
                  profileImage: true,
                  department: true
                }
              }
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              content: true,
              senderId: true,
              createdAt: true,
              sender: {
                select: {
                  id: true,
                  fullName: true
                }
              }
            }
          },
          booking: {
            select: {
              id: true,
              status: true,
              startDate: true,
              endDate: true,
              listing: {
                select: {
                  id: true,
                  title: true,
                  images: { orderBy: { displayOrder: 'asc' }, take: 1 }
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      conversation: {
        lastMessageAt: { sort: 'desc', nulls: 'last' }
      }
    }
  });

  return participants
    .map((p) => p.conversation)
    .filter(Boolean)
    .map((conv) => {
      const otherParticipant = conv.participants.find((p) => p.userId !== userId);
      return {
        id: conv.id,
        bookingId: conv.bookingId,
        booking: conv.booking,
        lastMessage: conv.messages[0] || null,
        otherUser: otherParticipant ? otherParticipant.user : null,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      };
    });
};

export const getConversationMessages = async (conversationId, userId, cursor, limit = 50) => {
  const isParticipant = await participantCheck(conversationId, userId);
  if (!isParticipant) {
    throw new ConversationError('You are not a participant in this conversation.', 403);
  }

  const where = { conversationId };
  if (cursor) {
    where.createdAt = { lt: new Date(cursor) };
  }

  const messages = await prisma.message.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          profileImage: true
        }
      }
    }
  });

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();

  return {
    messages: messages.reverse(),
    nextCursor: hasMore ? messages[0]?.createdAt.toISOString() : null,
    hasMore
  };
};

export const sendMessage = async ({ conversationId, senderId, content }) => {
  const message = await prisma.$transaction(async (tx) => {
    await tx.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    return tx.message.create({
      data: {
        conversationId,
        senderId,
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            profileImage: true
          }
        }
      }
    });
  });

  return message;
};

export const isParticipant = async (conversationId, userId) => {
  return participantCheck(conversationId, userId);
};

const participantCheck = async (conversationId, userId) => {
  const count = await prisma.conversationParticipant.count({
    where: {
      conversationId,
      userId
    }
  });
  return count > 0;
};

export default {
  createConversationForBooking,
  getMyConversations,
  getConversationMessages,
  sendMessage,
  isParticipant
};
