import express from 'express';
import * as listingController from '../controllers/listingController.js';

const router = express.Router();

// Map the GET request at the root ('/') of this router to the controller function
// Since this router will be mounted at '/api/listings', this resolves to GET /api/listings
router.get('/', listingController.getListings);

// Resolves to GET /api/listings/:id
router.get('/:id', listingController.getListing);

export default router;
