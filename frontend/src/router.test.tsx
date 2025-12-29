import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { RouterProvider, useRouter } from "../router";

describe("Router", () => {
  beforeEach(() => {
    // Reset hash before each test
    window.location.hash = "";
  });

  it("provides router context", () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: ({ children }) => <RouterProvider>{children}</RouterProvider>,
    });
    expect(result.current).toBeDefined();
    expect(typeof result.current.navigate).toBe("function");
    expect(typeof result.current.path).toBe("string");
  });

  it("defaults to root path", () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: ({ children }) => <RouterProvider>{children}</RouterProvider>,
    });
    expect(result.current.path).toBe("/");
  });

  it("updates hash when navigating", () => {
    const { result } = renderHook(() => useRouter(), {
      wrapper: ({ children }) => <RouterProvider>{children}</RouterProvider>,
    });
    result.current.navigate("/test");
    expect(window.location.hash).toBe("#/test");
  });
});
