import { Request, Response } from "express";
import { ZodError } from "zod";
import {
  createAuthSchema,
  loginSchema,
  resetConfirmSchema,
  resetRequestSchema,
  resetValidateSchema,
} from "./auth.schema";
import { authService } from "./auth.service";
import { resendVerification } from "./verification.service";
import { resendSchema } from "./auth.schema";
import {
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_TTL_SECONDS,
  CSRF_COOKIE_NAME,
} from "./token/token.config";
import { createCsrfToken } from "../shared/utils/csrf";
import { AuthError } from "./auth.errors";

export const createAuthHandler = async (req: Request, res: Response) => {
  try {
    const dto = createAuthSchema.parse(req.body);
    const user = await authService.register(dto);
    res.status(201).json({ id: user.id });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.issues });
      return;
    }
    res.status(500).json({ message: "Server error occurred." });
  }
};

export const resendVerificationHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = resendSchema.parse(req.body);
    const result = await resendVerification(email);
    res.status(200).json(result);
    return;
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.issues });
      return;
    }
    res.status(500).json({ message: "Server error occurred." });
    return;
  }
};

const isProd = process.env.NODE_ENV === "production";

export async function refreshHandler(req: Request, res: Response) {
  const refreshTokenPlain = req.cookies?.[REFRESH_COOKIE_NAME];

  if (!refreshTokenPlain || typeof refreshTokenPlain !== "string") {
    return res.status(401).json({ ok: false });
  }

  try {
    const { accessToken, newRefreshTokenPlain } = await authService.refresh({
      refreshTokenPlain,
      userAgent: req.get("user-agent"),
      ip: req.ip,
    });
    res.cookie(REFRESH_COOKIE_NAME, newRefreshTokenPlain, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/auth/refresh",
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    });

    const csrfToken = createCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({ ok: true, accessToken });
  } catch {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/auth/refresh" });
    return res.status(401).json({ ok: false });
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const dto = loginSchema.parse(req.body);

    const result = await authService.login({
      email: dto.email,
      password: dto.password,
      userAgent: req.get("user-agent"),
      ip: req.ip,
    });

    res.cookie(REFRESH_COOKIE_NAME, result.refreshTokenPlain, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/auth/refresh",
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    });

    const csrfToken = createCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({ ok: true, accessToken: result.accessToken });
  } catch (err) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid data", errors: err.issues });
    }
    if (err instanceof AuthError) {
      return res.status(err.status).json({ ok: false });
    }
    return res.status(500).json({ ok: false });
  }
}

export async function logoutHandler(req: Request, res: Response) {
  const refreshTokenPlain = req.cookies?.[REFRESH_COOKIE_NAME];

  await authService.logout(refreshTokenPlain);

  res.clearCookie(REFRESH_COOKIE_NAME, {
    path: "/auth/refresh",
    secure: isProd,
    httpOnly: true,
    sameSite: "lax",
  });

  res.clearCookie(CSRF_COOKIE_NAME, {
    path: "/",
    secure: isProd,
    sameSite: "lax",
  });

  return res.status(200).json({ ok: true });
}

export async function passwordResetRequestHandler(req: Request, res: Response) {
  try {
    const { email } = resetRequestSchema.parse(req.body);

    await authService.requestPasswordReset({
      email,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Enumeration protection
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ ok: false });
    }
    return res.status(500).json({ ok: false });
  }
}

export async function passwordResetValidateHandler(
  req: Request,
  res: Response
) {
  try {
    const { token } = resetValidateSchema.parse(req.body);

    await authService.validateResetToken(token);

    return res.status(200).json({ ok: true, valid: true });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ ok: false, valid: false });
    }
    return res.status(401).json({ ok: false, valid: false });
  }
}

export async function passwordResetConfirmHandler(req: Request, res: Response) {
  try {
    const { token, newPassword } = resetConfirmSchema.parse(req.body);

    await authService.confirmPasswordReset({
      tokenPlain: token,
      newPassword,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ ok: false });
    }
    return res.status(401).json({ ok: false });
  }
}

export async function logoutAllHandler(req: Request, res: Response) {
  if (!req.auth) {
    return res.status(401).json({ ok: false });
  }
  const userId = req.auth.userId; // access token'dan

  await authService.logoutAll(userId);

  res.clearCookie(REFRESH_COOKIE_NAME, {
    path: "/auth/refresh",
    secure: isProd,
    sameSite: "lax",
  });

  return res.status(200).json({ ok: true });
}
