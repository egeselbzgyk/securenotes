import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { RouterProvider } from "../router";
import { AuthProvider } from "../auth-context";

// Mock router
vi.mock("../router", () => ({
  RouterProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useRouter: () => ({
    path: "/",
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

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", async () => {
    render(
      <RouterProvider>
        <AuthProvider>
          <div data-testid="app-content">App</div>
        </AuthProvider>
      </RouterProvider>
    );
    await waitFor(() => {
      const content = screen.getByTestId("app-content");
      expect(content).toBeInTheDocument();
    });
  });

  it("renders children with AuthProvider", async () => {
    render(
      <RouterProvider>
        <AuthProvider>
          <div data-testid="test-children">Content</div>
        </AuthProvider>
      </RouterProvider>
    );
    await waitFor(() => {
      const children = screen.getByTestId("test-children");
      expect(children).toBeInTheDocument();
    });
  });
});
