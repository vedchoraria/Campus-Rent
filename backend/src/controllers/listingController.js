import * as listingService from '../services/listingService.js';
import * as uploadService from '../services/uploadService.js';
import { createListingSchema, updateListingSchema, validate } from '../utils/validation.js';

/**
 * Controller to handle the GET /api/listings request.
 * Supports query params: q (search), category, page, limit.
 */
export const getListings = async (req, res) => {
  try {
    const { q, category, page, limit } = req.query;

    const result = await listingService.getActiveListings({
      q: q || undefined,
      category: category || undefined,
      page: page !== undefined ? Number(page) : undefined,
      limit: limit !== undefined ? Number(limit) : undefined
    });

    // result looks like: { data: [...], pagination: { total, page, limit, totalPages } }
    const { data, pagination } = result;

    res.status(200).json({
      success: true,
      count: data.length,
      data,
      ...(pagination ? { pagination } : {})
    });
  } catch (error) {
    console.error('Error in getListings controller:', error);
    
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

export const getMyListings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const listings = await listingService.getMyListings(userId);

    res.status(200).json({
      success: true,
      data: listings
    });
  } catch (error) {
    console.error('Error fetching my listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your listings. Please try again later.'
    });
  }
};

export const createListing = async (req, res) => {
  try {
    const validation = validate(createListingSchema, req.body || {});
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validation.errors
      });
    }

    const userId = req.user.id;
    const createdListing = await listingService.createListing(userId, validation.data);

    res.status(201).json({
      success: true,
      data: createdListing
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create listing. Please try again later.'
    });
  }
};

export const uploadListingImage = async (req, res) => {
  try {
    const uploaded = await uploadService.uploadImageToCloudinary(req.file);

    res.status(201).json({
      success: true,
      data: uploaded
    });
  } catch (error) {
    console.error('Error uploading listing image:', error);
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    res.status(statusCode).json({
      success: false,
      message: error?.message || 'Failed to upload image. Please try again later.'
    });
  }
};

/**
 * Controller to handle the PATCH /api/listings/:id request.
 */
export const updateListing = async (req, res) => {
  try {
    const validation = validate(updateListingSchema, req.body || {});
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validation.errors
      });
    }

    const userId = req.user.id;
    const { id } = req.params;

    const updatedListing = await listingService.updateListing(id, userId, validation.data);

    res.status(200).json({
      success: true,
      data: updatedListing
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    res.status(statusCode).json({
      success: false,
      message: error?.message || 'Failed to update listing. Please try again later.'
    });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await listingService.deleteListing(id, userId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    res.status(statusCode).json({
      success: false,
      message: error?.message || 'Failed to delete listing. Please try again later.'
    });
  }
};
