import { prisma } from "./lib/prisma";

describe("Database Connection", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should connect to the database and return user count", async () => {
    // connecting to the database and querying
    const userCount = await prisma.user.count();

    // asserting the user count
    expect(typeof userCount).toBe("number");
    expect(userCount).toBeGreaterThanOrEqual(0);
  });
});
