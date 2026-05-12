import prisma from '../utils/prismaClient.js';

class BookingError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'BookingError';
    this.statusCode = statusCode;
  }
}

export const getMyBookings = async (userId) => {
  const commonInclude = {
    listing: {
      select: {
        id: true,
        title: true,
        securityDeposit: true,
        images: { orderBy: { displayOrder: 'asc' }, take: 1 }
      }
    },
    borrower: {
      select: {
        id: true,
        fullName: true,
        profileImage: true,
        department: true
      }
    },
    cancelledBy: {
      select: {
        id: true,
        fullName: true
      }
    }
  };

  const borrowings = await prisma.booking.findMany({
    where: { borrowerId: userId },
    include: commonInclude,
    orderBy: { createdAt: 'desc' }
  });

  const lending = await prisma.booking.findMany({
    where: { ownerId: userId },
    include: commonInclude,
    orderBy: { createdAt: 'desc' }
  });

  return { borrowings, lending };
};

export const createBooking = async (payload) => {
  const { listingId, borrowerId, startDate, endDate, pickupZone = '', pickupTime = null } = payload || {};

  if (!listingId || !borrowerId || !startDate || !endDate) {
    throw new BookingError('listingId, borrowerId, startDate and endDate are required.', 400);
  }

  const parsedStart = new Date(startDate);
  const parsedEnd = new Date(endDate);
  if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
    throw new BookingError('Invalid booking dates provided.', 400);
  }

  if (parsedEnd < parsedStart) {
    throw new BookingError('End date cannot be before start date.', 400);
  }

  const listing = await prisma.listing.findUnique({
    where: { id: String(listingId) },
    select: {
      id: true,
      ownerId: true,
      dailyRentalRate: true,
      securityDeposit: true
    }
  });

  if (!listing) {
    throw new BookingError('Listing not found.', 404);
  }

  const overlap = await prisma.booking.findFirst({
    where: {
      listingId: listing.id,
      status: { in: ['upcoming', 'ongoing'] },
      startDate: { lte: parsedEnd },
      endDate: { gte: parsedStart }
    },
    select: {
      id: true,
      startDate: true,
      endDate: true
    }
  });

  if (overlap) {
    throw new BookingError('Requested dates overlap with an existing booking.', 409);
  }

  const days = Math.floor((parsedEnd.getTime() - parsedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalPriceSnapshot = Number((listing.dailyRentalRate * days).toFixed(2));

  const booking = await prisma.booking.create({
    data: {
      listingId: listing.id,
      borrowerId: String(borrowerId),
      ownerId: listing.ownerId,
      startDate: parsedStart,
      endDate: parsedEnd,
      status: 'pending',
      totalPriceSnapshot,
      securityDepositSnapshot: listing.securityDeposit,
      pickupZone: pickupZone || 'Default Zone',
      pickupTime: pickupTime ? new Date(pickupTime) : null
    }
  });

  return booking;
};

const ALLOWED_TARGET_STATUSES = new Set(['upcoming', 'rejected', 'cancelled', 'completed']);

export const updateBookingStatus = async ({ bookingId, actorId, status }) => {
  if (!bookingId || !actorId || !status) {
    throw new BookingError('bookingId, actorId and status are required.', 400);
  }

  const nextStatus = String(status).toLowerCase();
  if (!ALLOWED_TARGET_STATUSES.has(nextStatus)) {
    throw new BookingError('Unsupported booking status transition.', 400);
  }

  const booking = await prisma.booking.findUnique({
    where: { id: String(bookingId) },
    select: {
      id: true,
      listingId: true,
      borrowerId: true,
      ownerId: true,
      startDate: true,
      endDate: true,
      status: true
    }
  });

  if (!booking) {
    throw new BookingError('Booking not found.', 404);
  }

  const isOwner = booking.ownerId === String(actorId);
  const isBorrower = booking.borrowerId === String(actorId);
  if (!isOwner && !isBorrower) {
    throw new BookingError('You are not authorized to update this booking.', 403);
  }

  const now = new Date();
  const data = {};

  if (nextStatus === 'upcoming') {
    if (!isOwner) {
      throw new BookingError('Only the listing owner can approve this booking.', 403);
    }
    if (booking.status !== 'pending') {
      throw new BookingError('Only pending bookings can be approved.', 409);
    }

    const conflict = await prisma.booking.findFirst({
      where: {
        listingId: booking.listingId,
        id: { not: booking.id },
        status: { in: ['upcoming', 'ongoing'] },
        startDate: { lte: booking.endDate },
        endDate: { gte: booking.startDate }
      },
      select: { id: true }
    });

    if (conflict) {
      throw new BookingError('Cannot approve: dates overlap with an existing confirmed booking.', 409);
    }

    data.status = 'upcoming';
    data.approvedAt = now;
  } else if (nextStatus === 'rejected') {
    if (!isOwner) {
      throw new BookingError('Only the listing owner can reject this booking.', 403);
    }
    if (booking.status !== 'pending') {
      throw new BookingError('Only pending bookings can be rejected.', 409);
    }
    data.status = 'rejected';
  } else if (nextStatus === 'cancelled') {
    if (!['pending', 'upcoming', 'ongoing'].includes(booking.status)) {
      throw new BookingError('Only pending, upcoming, or ongoing bookings can be cancelled.', 409);
    }
    data.status = 'cancelled';
    data.cancelledAt = now;
    data.cancelledById = String(actorId);
  } else if (nextStatus === 'completed') {
    if (!['upcoming', 'ongoing'].includes(booking.status)) {
      throw new BookingError('Only active bookings can be marked as completed.', 409);
    }
    data.status = 'completed';
    data.returnedAt = now;
  }

  return prisma.booking.update({
    where: { id: booking.id },
    data
  });
};
