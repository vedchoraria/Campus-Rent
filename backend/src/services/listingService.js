import prisma from '../utils/prismaClient.js';

class ListingError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'ListingError';
    this.statusCode = statusCode;
  }
}

/**
 * Retrieves all active listings from the database.
 * Uses relation queries to include owner metadata and ordered images.
 */
export const getActiveListings = async () => {
  // The 'findMany' query hits the database.
  const listings = await prisma.listing.findMany({
    // Only return items where status is 'active' (enum)
    where: {
      status: 'active',
    },
    // The 'include' clause fetches related data from other tables
    include: {
      // Include the images relation, ordered by displayOrder
      images: {
        orderBy: {
          displayOrder: 'asc',
        },
        // We use 'select' inside include to return ONLY specific columns
        select: {
          imageUrl: true,
          displayOrder: true,
        },
      },
      // Include the owner relation, but restrict the fields!
      // This is critical for security: we do NOT want to send 'collegeEmail' to the frontend.
      owner: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
          department: true,
          lenderRating: true,
        },
      },
    },
    // Sort newest listings first
    orderBy: {
      createdAt: 'desc',
    },
  });

  return listings;
};

/**
 * Retrieves a single listing by ID.
 * Excludes 'deleted' items.
 * Includes owner metadata, ordered images, and active bookings.
 */
export const getListingById = async (id) => {
  const listing = await prisma.listing.findFirst({
    where: {
      id: id,
      status: { not: 'deleted' }
    },
    include: {
      images: {
        orderBy: {
          displayOrder: 'asc',
        },
        select: {
          imageUrl: true,
          displayOrder: true,
        },
      },
      owner: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
          department: true,
          lenderRating: true,
        },
      },
      bookings: {
        where: {
          status: {
            in: ['upcoming', 'ongoing']
          }
        },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
        }
      }
    },
  });

  return listing;
};

/**
 * Fetch all listings owned by a specific user.
 * This explicitly includes hidden listings.
 */
export const getMyListings = async (userId) => {
  const listings = await prisma.listing.findMany({
    where: { 
      ownerId: userId,
      status: { not: 'deleted' }
    },
    include: {
      images: {
        orderBy: {
          displayOrder: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return listings;
};

/**
 * Create a listing with related images for a specific owner.
 */
export const createListing = async (ownerId, payload) => {
  const listing = await prisma.listing.create({
    data: {
      title: payload.title,
      description: payload.description,
      category: payload.category,
      condition: payload.condition,
      dailyRentalRate: payload.dailyRentalRate,
      securityDeposit: payload.securityDeposit,
      retailPrice: payload.retailPrice,
      minimumRentalDays: payload.minimumRentalDays,
      preferredPickupZone: payload.preferredPickupZone,
      customPickupNote: payload.customPickupNote || null,
      status: 'active',
      ownerId,
      images: {
        create: (payload.images || []).map((image, index) => ({
          imageUrl: image.imageUrl,
          displayOrder: typeof image.displayOrder === 'number' ? image.displayOrder : index
        }))
      }
    },
    include: {
      images: {
        orderBy: {
          displayOrder: 'asc'
        },
        select: {
          imageUrl: true,
          displayOrder: true
        }
      },
      owner: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
          department: true,
          lenderRating: true
        }
      }
    }
  });

  return listing;
};

export const deleteListing = async (listingId, ownerId) => {
  const listing = await prisma.listing.findUnique({
    where: { id: String(listingId) },
    select: { id: true, ownerId: true, status: true }
  });

  if (!listing || listing.status === 'deleted') {
    throw new ListingError('Listing not found.', 404);
  }

  if (listing.ownerId !== String(ownerId)) {
    throw new ListingError('You are not allowed to delete this listing.', 403);
  }

  await prisma.listing.update({
    where: { id: listing.id },
    data: { status: 'deleted' }
  });

  return { id: listing.id };
};
