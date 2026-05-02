import express from 'express';
import cors from 'cors';
import listingRoutes from './routes/listingRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'CampusRent API is running' });
});

// Future routes will be mounted here
app.use('/api/listings', listingRoutes);

export default app;
