import { prisma } from "../src/lib/prisma";
import argon2 from "argon2";

async function main() {
  // Generate a proper argon2 hash for password "Test123!"
  const passwordHash = await argon2.hash("Test123!", {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      passwordHash,
      emailVerifiedAt: new Date(), // Auto-verify for testing
    },
  });

  console.log({ user });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
