import express from 'express';
import * as conversationController from '../controllers/conversationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, conversationController.getMyConversations);
router.get('/:conversationId/messages', requireAuth, conversationController.getConversationMessages);

export default router;
