import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthApi, NotesApi, setAccessToken, getAccessToken } from "../api";

describe("API Module", () => {
  beforeEach(() => {
    // Reset access token
    setAccessToken(null);
    global.fetch = vi.fn();
  });

  describe("Token Management", () => {
    it("sets and gets access token", () => {
      setAccessToken("test-token-123");
      expect(getAccessToken()).toBe("test-token-123");
    });

    it("clears access token", () => {
      setAccessToken("test-token-123");
      setAccessToken(null);
      expect(getAccessToken()).toBeNull();
    });
  });

  describe("AuthApi", () => {
    it("has login method", () => {
      expect(typeof AuthApi.login).toBe("function");
    });

    it("has register method", () => {
      expect(typeof AuthApi.register).toBe("function");
    });

    it("has logout method", () => {
      expect(typeof AuthApi.logout).toBe("function");
    });

    it("has refresh method", () => {
      expect(typeof AuthApi.refresh).toBe("function");
    });
  });

  describe("NotesApi", () => {
    it("has list method", () => {
      expect(typeof NotesApi.list).toBe("function");
    });

    it("has get method", () => {
      expect(typeof NotesApi.get).toBe("function");
    });

    it("has create method", () => {
      expect(typeof NotesApi.create).toBe("function");
    });

    it("has update method", () => {
      expect(typeof NotesApi.update).toBe("function");
    });

    it("has delete method", () => {
      expect(typeof NotesApi.delete).toBe("function");
    });
  });
});
