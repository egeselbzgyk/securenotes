import { prisma } from "../lib/prisma"; // Global prisma instance
import { Prisma } from "../generated/client/client";

type DbClient = Prisma.TransactionClient | typeof prisma;

export const authRepository = {
  // Find user by email
  findUserByEmail(email: string, tx: DbClient = prisma) {
    return tx.user.findUnique({ where: { email } });
  },

  // Create user
  createUser(tx: DbClient, data: Prisma.UserCreateInput) {
    return tx.user.create({ data });
  },

  // Create identity
  createIdentity(tx: DbClient, data: Prisma.UserIdentityCreateInput) {
    return tx.userIdentity.create({ data });
  },

  // Update user verification token
  updateUserVerificationToken(
    userId: string,
    tokenHash: string,
    tx: DbClient = prisma
  ) {
    return tx.user.update({
      where: { id: userId, emailVerifiedAt: null },
      data: {
        emailVerificationTokenHash: tokenHash,
        emailVerificationTokenSentAt: new Date(),
      },
    });
  },

  async updateLoginFailure(
    userId: string,
    data: {
      failedLoginAttempts: number;
      lockedUntil: Date | null;
    }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: data.failedLoginAttempts,
        lockedUntil: data.lockedUntil,
      },
      select: { id: true },
    });
  },

  async updateLoginSuccess(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
      select: { id: true },
    });
  },

  async updatePassword(
    userId: string,
    data: { passwordHash: string; passwordChangedAt: Date }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: data.passwordHash,
        passwordChangedAt: data.passwordChangedAt,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
      select: { id: true },
    });
  },
};

export const findUserByEmailVerificationToken = (
  tokenHash: string,
  tx: DbClient = prisma
) => {
  return tx.user.findFirst({
    where: {
      emailVerificationTokenHash: tokenHash,
      emailVerifiedAt: null,
      deletedAt: null,
      isActive: true, // User is not active
    },
    select: { id: true, emailVerificationTokenSentAt: true },
  });
};

// Verify user email
export const verifyUserEmail = (userId: string, tx: DbClient = prisma) => {
  return tx.user.update({
    where: { id: userId },
    data: {
      emailVerifiedAt: new Date(),
      emailVerificationTokenHash: null,
      emailVerificationTokenSentAt: null,
    },
  });
};

// OAuth State Management
export const createOAuthState = async (
  state: string,
  provider: string,
  meta: {
    ip?: string | null;
    userAgent?: string | null;
  }
) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return prisma.oAuthState.create({
    data: {
      state,
      provider,
      expiresAt,
      ip: meta.ip,
      userAgent: meta.userAgent,
    },
  });
};

export const findAndConsumeOAuthState = async (state: string) => {
  const now = new Date();

  const oAuthState = await prisma.oAuthState.findFirst({
    where: {
      state,
      expiresAt: { gt: now },
      consumedAt: null,
    },
  });

  if (!oAuthState) {
    return null;
  }

  // Mark as consumed to prevent replay attacks
  await prisma.oAuthState.update({
    where: { id: oAuthState.id },
    data: { consumedAt: now },
  });

  return oAuthState;
};

export const cleanupExpiredOAuthStates = async () => {
  const now = new Date();
  return prisma.oAuthState.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  });
};
