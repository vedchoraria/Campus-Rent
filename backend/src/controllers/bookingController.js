import * as bookingService from '../services/bookingService.js';

export const getMyBookings = async (req, res) => {
  try {
    // Temporary hardcoded seeded user (Alex Rivera) until Auth is implemented
    const userId = "07470ac1-1ca0-42ee-a694-ea9dca3d064c"; 
    
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
    // Temporary hardcoded seeded user (Alex Rivera) until Auth is implemented
    const borrowerId = "07470ac1-1ca0-42ee-a694-ea9dca3d064c";
    const payload = { ...req.body, borrowerId };

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
