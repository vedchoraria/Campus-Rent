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

/**
 * Controller to handle the GET /api/listings/:id request.
 */
export const getListing = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Call the service to fetch the specific listing
    const listing = await listingService.getListingById(id);

    // 2. Handle missing/deleted listing
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or has been removed',
      });
    }

    // 3. Send successful response
    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error(`Error in getListing controller for ID ${req.params.id}:`, error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listing details. Please try again later.',
    });
  }
};
