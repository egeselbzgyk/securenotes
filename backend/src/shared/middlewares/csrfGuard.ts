import type { Request, Response, NextFunction } from "express";
import {
  CSRF_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from "../../auth/token/token.config";

export function csrfGuard(req: Request, res: Response, next: NextFunction) {
  const m = req.method.toUpperCase();
  if (m === "GET" || m === "HEAD" || m === "OPTIONS") return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.get("x-csrf-token");

  // For refresh endpoint: if no refresh token exists, allow without CSRF check
  // This handles the initial auth state where user has no session yet
  if (req.path === "/auth/refresh") {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      // No refresh token means no session, so no CSRF needed
      return next();
    }
  }

  if (!cookieToken || !headerToken) return res.status(403).json({ ok: false });
  if (cookieToken !== headerToken) return res.status(403).json({ ok: false });

  return next();
}
