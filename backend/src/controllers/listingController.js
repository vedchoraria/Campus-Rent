import * as listingService from '../services/listingService.js';

/**
 * Controller to handle the GET /api/listings request.
 */
export const getListings = async (req, res) => {
  try {
    // 1. Call the service to fetch pure data from Prisma
    const listings = await listingService.getActiveListings();

    // 2. Use Express 'res' to send a JSON payload back to the client
    // We send a 200 OK status, and structure the payload securely.
    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error('Error in getListings controller:', error);
    
    // Send a 500 Internal Server Error if something breaks
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings. Please try again later.',
    });
  }
};
