import prisma from '../utils/prismaClient.js';

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
