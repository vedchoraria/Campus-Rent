import jwt from 'jsonwebtoken';
import prisma from '../utils/prismaClient.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required.'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'JWT configuration is missing.'
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
      select: {
        id: true,
        fullName: true,
        collegeEmail: true,
        department: true,
        yearOfStudy: true,
        profileImage: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};
