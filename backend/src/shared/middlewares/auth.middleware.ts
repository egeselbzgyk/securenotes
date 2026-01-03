import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { TextEncoder } from "util";
import { validateApiKey } from "../../api-keys/api-keys.service";

const jwtKey = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  // 1. Check for API Key first
  const apiKey = req.get("x-api-key");
  if (apiKey) {
    const user = await validateApiKey(apiKey);
    if (user) {
      req.user = {
        id: user.id,
      };
      // API Key auth does not have a session ID
      return next();
    }
    // Explicit API key provided but invalid
    return res.status(401).json({ ok: false, message: "Invalid API Key" });
  }

  // 2. Check for JWT (Bearer Token)
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
