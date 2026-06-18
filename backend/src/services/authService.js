import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import prisma from '../utils/prismaClient.js';
import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';

class AuthError extends AppError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.name = 'AuthError';
  }
}

const JWT_EXPIRES_IN = '7d';
const BCRYPT_ROUNDS = 10;

const ensureJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
};

const sanitizeUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  collegeEmail: user.collegeEmail,
  role: user.role,
  department: user.department,
  yearOfStudy: user.yearOfStudy,
  profileImage: user.profileImage,
});

const generateToken = (user) => {
  const secret = ensureJwtSecret();
  return jwt.sign(
    {
      sub: user.id,
      email: user.collegeEmail,
      role: user.role,
    },
    secret,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const signup = async ({ fullName, collegeEmail, password }) => {
  if (!fullName || !collegeEmail || !password) {
    throw new AuthError('fullName, collegeEmail and password are required.', 400);
  }

  const normalizedEmail = String(collegeEmail).trim().toLowerCase();

  const existingUsers = await prisma.$queryRaw`
    SELECT id
    FROM "User"
    WHERE "collegeEmail" = ${normalizedEmail}
    LIMIT 1
  `;
  const existingUser = existingUsers[0];

  if (existingUser) {
    throw new AuthError('An account with this email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(String(password), BCRYPT_ROUNDS);
  const userId = randomUUID();

  const createdUsers = await prisma.$queryRaw`
    INSERT INTO "User" ("id", "fullName", "collegeEmail", "passwordHash", "role", "preferredPickupZones", "lenderRating", "ratingsCount", "createdAt", "updatedAt")
    VALUES (${userId}, ${String(fullName).trim()}, ${normalizedEmail}, ${passwordHash}, 'USER'::"Role", ARRAY[]::text[], 0, 0, NOW(), NOW())
    RETURNING id, "fullName", "collegeEmail", "role", department, "yearOfStudy", "profileImage"
  `;
  const user = createdUsers[0];

  return {
    token: generateToken(user),
    user: sanitizeUser(user)
  };
};

export const login = async ({ collegeEmail, password }) => {
  if (!collegeEmail || !password) {
    throw new AuthError('collegeEmail and password are required.', 400);
  }

  const normalizedEmail = String(collegeEmail).trim().toLowerCase();
  const users = await prisma.$queryRaw`
    SELECT id, "fullName", "collegeEmail", "passwordHash", "role", department, "yearOfStudy", "profileImage"
    FROM "User"
    WHERE "collegeEmail" = ${normalizedEmail}
    LIMIT 1
  `;
  const user = users[0];

  if (!user) {
    logger.warn({ email: normalizedEmail }, 'Failed login attempt: email not found');
    throw new AuthError('Invalid credentials.', 401);
  }

  const isValidPassword = await bcrypt.compare(String(password), user.passwordHash);
  if (!isValidPassword) {
    logger.warn({ email: normalizedEmail }, 'Failed login attempt: incorrect password');
    throw new AuthError('Invalid credentials.', 401);
  }

  return {
    token: generateToken(user),
    user: sanitizeUser(user)
  };
};

export { AuthError };
