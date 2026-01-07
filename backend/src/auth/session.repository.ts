import { prisma } from "../lib/prisma";
import { Prisma } from "../generated/client/client";

export type CreateSessionInput = {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  userAgent?: string | null;
  ip?: string | null;
};

export const sessionRepository = {
  async createSession(
    input: CreateSessionInput,
    tx: Prisma.TransactionClient | typeof prisma = prisma
  ) {
    return tx.session.create({
      data: {
        userId: input.userId,
        refreshTokenHash: input.refreshTokenHash,
        expiresAt: input.expiresAt,
        userAgent: input.userAgent ?? null,
        ip: input.ip ?? null,
      },
      select: {
        id: true,
        userId: true,
        refreshTokenHash: true,
        expiresAt: true,
        revokedAt: true,
        rotatedAt: true,
        replacedBySessionId: true,
        createdAt: true,
      },
    });
  },

  async findByRefreshTokenHash(refreshTokenHash: string) {
    return prisma.session.findUnique({
      where: { refreshTokenHash },
      include: {
        user: {
          select: {
            id: true,
            isActive: true,
            emailVerifiedAt: true,
            passwordChangedAt: true,
          },
        },
      },
    });
  },
  async revokeSession(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
      select: {
        id: true,
        revokedAt: true,
      },
    });
  },

  async revokeAllForUser(userId: string, revokedAt: Date = new Date()) {
    return prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt },
    });
  },

  /**
   * Rotation: Create new session + mark old session as rotated/replaced.
   * Single transaction: to avoid partial completion.
   */
  async rotateSession(params: {
    oldSessionId: string;
    userId: string;
    newRefreshTokenHash: string;
    newExpiresAt: Date;
    userAgent?: string | null;
    ip?: string | null;
  }) {
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const newSession = await tx.session.create({
        data: {
          userId: params.userId,
          refreshTokenHash: params.newRefreshTokenHash,
          expiresAt: params.newExpiresAt,
          userAgent: params.userAgent ?? null,
          ip: params.ip ?? null,
        },
        select: {
          id: true,
          userId: true,
          refreshTokenHash: true,
          expiresAt: true,
          createdAt: true,
        },
      });
      await tx.session.update({
        where: { id: params.oldSessionId },
        data: {
          rotatedAt: now,
          replacedBySessionId: newSession.id,
        },
        select: { id: true },
      });
      return newSession;
    });
  },

  async isSessionActive(session: { revokedAt: Date | null; expiresAt: Date }) {
    return (
      session.revokedAt === null && session.expiresAt.getTime() > Date.now()
    );
  },
};
