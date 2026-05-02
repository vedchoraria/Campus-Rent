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
