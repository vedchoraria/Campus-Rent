import express from 'express';
import * as bookingController from '../controllers/bookingController.js';

const router = express.Router();

router.get('/my-bookings', bookingController.getMyBookings);

export default router;
