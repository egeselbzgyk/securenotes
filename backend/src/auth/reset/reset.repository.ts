import { prisma } from "../../lib/prisma"; // Global prisma instance

export const resetRepository = {
  async createToken(params: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ip?: string | null;
    userAgent?: string | null;
  }) {
    return prisma.passwordResetToken.create({
      data: {
        userId: params.userId,
        tokenHash: params.tokenHash,
        expiresAt: params.expiresAt,
        ip: params.ip ?? null,
        userAgent: params.userAgent ?? null,
      },
      select: { id: true, userId: true, tokenHash: true, expiresAt: true },
    });
  },

  async findByHash(tokenHash: string) {
    return prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, isActive: true } } },
    });
  },

  async markUsed(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
      select: { id: true, usedAt: true },
    });
  },

  async deleteAllForUser(userId: string) {
    return prisma.passwordResetToken.deleteMany({ where: { userId } });
  },
};
