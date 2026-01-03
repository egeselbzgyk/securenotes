import { prisma } from "../lib/prisma";
import crypto from "crypto";
import { CreateApiKeyInput } from "./api-keys.schema";

const KEY_PREFIX = "sn_";

// Helper to hash key for storage
const hashKey = (key: string): string => {
  return crypto.createHash("sha256").update(key).digest("hex");
};

export const generateApiKey = async (
  userId: string,
  input: CreateApiKeyInput
) => {
  // Generate 32 bytes of random data
  const randomBytes = crypto.randomBytes(32).toString("hex");
  const key = `${KEY_PREFIX}${randomBytes}`;
  const hashedKey = hashKey(key);

  // Calculate expiration date if provided
  let expiresAt: Date | null = null;
  if (input.expiresInDays) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);
  }

  const apiKey = await prisma.apiKey.create({
    data: {
      key: hashedKey,
      name: input.name,
      userId,
      expiresAt,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      expiresAt: true,
      // We do NOT return the hashed key here, but we return the plain key ONLY ONCE
    },
  });

  return {
    ...apiKey,
    key, // Return the plain text key only now
  };
};

export const listUserKeys = async (userId: string) => {
  return await prisma.apiKey.findMany({
    where: {
      userId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      expiresAt: true,
      lastUsedAt: true,
      // Never select 'key' (the hash)
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const revokeKey = async (keyId: string, userId: string) => {
  // Verify ownership
  const key = await prisma.apiKey.findFirst({
    where: {
      id: keyId,
      userId,
    },
  });

  if (!key) {
    return false;
  }

  await prisma.apiKey.delete({
    where: {
      id: keyId,
    },
  });

  return true;
};

export const validateApiKey = async (rawKey: string) => {
  if (!rawKey.startsWith(KEY_PREFIX)) {
    return null;
  }

  const hashedKey = hashKey(rawKey);

  const apiKey = await prisma.apiKey.findUnique({
    where: {
      key: hashedKey,
    },
    include: {
      user: true,
    },
  });

  if (!apiKey || !apiKey.isActive) {
    return null;
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null;
  }

  // Security Check: Ensure user is still active
  if (!apiKey.user.isActive) {
    return null;
  }

  // Update last used timestamp
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return apiKey.user;
};
