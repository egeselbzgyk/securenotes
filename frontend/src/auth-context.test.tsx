import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { AuthProvider, useAuth } from "../auth-context";

// Mock router
vi.mock("../router", () => ({
  useRouter: () => ({
    navigate: vi.fn(),
  }),
}));

// Mock api
vi.mock("../api", () => ({
  setAccessToken: vi.fn(),
  AuthApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn().mockRejectedValue(new Error("No session")),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides default auth state", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("has login and logout functions", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.logout).toBe("function");
    expect(typeof result.current.register).toBe("function");
  });
});
