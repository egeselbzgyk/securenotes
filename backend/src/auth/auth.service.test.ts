import { passwordService } from "./password.service";

describe("AuthService - Password Validation", () => {
  describe("Password Strength Validation", () => {
    it("should accept strong password", () => {
      expect(() => {
        passwordService.assertStrong("StrongP@ssw0rd!", { userInputs: [] });
      }).not.toThrow();
    });

    it("should reject weak password", () => {
      expect(() => {
        passwordService.assertStrong("password123", { userInputs: [] });
      }).toThrow("WEAK_PASSWORD");
    });

    it("should reject password containing username", () => {
      expect(() => {
        passwordService.assertStrong("Username123!", {
          userInputs: ["username"],
        });
      }).toThrow("WEAK_PASSWORD");
    });

    it("should reject password containing email", () => {
      expect(() => {
        passwordService.assertStrong("Example123!", {
          userInputs: ["user@example.com"],
        });
      }).toThrow("WEAK_PASSWORD");
    });

    it("should reject password with common pattern", () => {
      expect(() => {
        passwordService.assertStrong("Password123!", { userInputs: [] });
      }).toThrow("WEAK_PASSWORD");
    });

    it("should reject password with sequential characters", () => {
      expect(() => {
        passwordService.assertStrong("Abcdef12!", { userInputs: [] });
      }).toThrow("WEAK_PASSWORD");
    });

    it("should reject password with repeated patterns", () => {
      expect(() => {
        passwordService.assertStrong("aaaaaa111!!", { userInputs: [] });
      }).toThrow("WEAK_PASSWORD");
    });

    it("should reject very weak password", () => {
      expect(() => {
        passwordService.assertStrong("12345678", { userInputs: [] });
      }).toThrow("WEAK_PASSWORD");
    });
  });

  describe("Password Hashing", () => {
    it("should hash password with argon2id", async () => {
      const hash = await passwordService.hash("TestPassword123!");
      expect(hash).toMatch(/^\$argon2id\$/);
    });

    it("should verify correct password", async () => {
      const password = "TestPassword123!";
      const hash = await passwordService.hash(password);
      const isValid = await passwordService.verify(hash, password);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const hash = await passwordService.hash("CorrectPassword123!");
      const isValid = await passwordService.verify(hash, "WrongPassword123!");
      expect(isValid).toBe(false);
    });

    it("should generate different hashes for same password", async () => {
      const password = "TestPassword123!";
      const hash1 = await passwordService.hash(password);
      const hash2 = await passwordService.hash(password);
      expect(hash1).not.toBe(hash2);
    });
  });
});
