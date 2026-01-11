import type { Request, Response, NextFunction } from "express";
import { CSRF_COOKIE_NAME } from "../../auth/token/token.config";

export function csrfGuard(req: Request, res: Response, next: NextFunction) {
  const m = req.method.toUpperCase();
  if (m === "GET" || m === "HEAD" || m === "OPTIONS") return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.get("x-csrf-token");

  if (!cookieToken || !headerToken) return res.status(403).json({ ok: false });
  if (cookieToken !== headerToken) return res.status(403).json({ ok: false });

  return next();
}
