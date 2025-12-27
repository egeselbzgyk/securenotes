import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { TextEncoder } from "util";

const jwtKey = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  const authHeader = req.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false });
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, jwtKey);

    const userId = payload.sub as string;
    const sessionId = payload.sid as string;

    req.auth = {
      userId,
      sessionId,
    };

    // Also set req.user for backward compatibility with controllers that use it
    req.user = {
      id: userId,
    };

    next();
  } catch {
    return res.status(401).json({ ok: false });
  }
}
