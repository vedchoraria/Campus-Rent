import * as bookingService from '../services/bookingService.js';
import { createBookingSchema, validate } from '../utils/validation.js';

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const data = await bookingService.getMyBookings(userId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in getMyBookings controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings. Please try again later.'
    });
  }
};

export const createBooking = async (req, res) => {
  try {
    const validation = validate(createBookingSchema, req.body || {});
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validation.errors
      });
    }

    const borrowerId = req.user.id;
    const payload = { ...validation.data, borrowerId };

    const booking = await bookingService.createBooking(payload);

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error in createBooking controller:', error);
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    res.status(statusCode).json({
      success: false,
      message: error?.message || 'Failed to create booking. Please try again later.'
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const actorId = req.user.id;
    const { bookingId } = req.params;
    const { status } = req.body || {};

    const booking = await bookingService.updateBookingStatus({
      bookingId,
      actorId,
      status
    });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error in updateBookingStatus controller:', error);
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    res.status(statusCode).json({
      success: false,
      message: error?.message || 'Failed to update booking status. Please try again later.'
    });
  }
};
