import { Request, Response, NextFunction } from "express";

const ALLOWED_ORIGINS = new Set(
  (
    process.env.CORS_ORIGINS ??
    "http://localhost:5173,http://localhost:3000,http://localhost"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);

export function originGuard(req: Request, res: Response, next: NextFunction) {
  const m = req.method.toUpperCase();
  if (m === "OPTIONS" || m === "GET" || m === "HEAD") return next();

  const origin = req.get("origin");
  const referer = req.get("referer");

  const value = origin ?? (referer ? new URL(referer).origin : "");
  if (!value) return res.status(403).json({ ok: false });

  if (ALLOWED_ORIGINS.has(value)) return next();
  return res.status(403).json({ ok: false });
}
