import prisma from '../utils/prismaClient.js';

export const getMyBookings = async (userId) => {
  const commonInclude = {
    listing: {
      select: {
        id: true,
        title: true,
        imageClass: true,
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
