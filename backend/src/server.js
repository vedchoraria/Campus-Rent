import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import dotenv from 'dotenv';
import { corsOptions } from './config/cors.js';
import { socketAuth } from './socket/auth.js';
import { registerSocketHandlers } from './socket/handler.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: corsOptions,
  // Only allow transport via WebSocket to avoid long-polling overhead
  transports: ['websocket', 'polling']
});

// Apply JWT authentication middleware to all socket connections
io.use(socketAuth);

// Register all socket event handlers
registerSocketHandlers(io);

// Make io accessible to other modules (for emitting from REST handlers)
app.set('io', io);

httpServer.listen(PORT, () => {
  logger.info({ port: PORT }, `Server is running on port ${PORT}`);
});
