import { Request, Response } from "express";
import {
  authRepository,
  findUserByEmailVerificationToken,
  verifyUserEmail,
} from "./auth.repository";
import { tokenService } from "./token/token.service";
import { mailService } from "../shared/services/mailService";
import { verifySchema } from "./auth.schema";
import { normalizeEmail } from "../shared/utils/normalizeEmail";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export async function verifyEmailRedirect(req: Request, res: Response) {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const frontendBase = process.env.FRONTEND_BASE_URL ?? "http://localhost:5173";

  if (!token) return res.redirect(302, `${frontendBase}/verify-failed`);

  return res.redirect(
    302,
    `${frontendBase}/verify-email?token=${encodeURIComponent(token)}`
  );
}

export async function verifyEmailHandler(req: Request, res: Response) {
  const { token } = verifySchema.parse(req.body);

  const tokenHash = tokenService.hashToken(token);
  const user = await findUserByEmailVerificationToken(tokenHash);

  if (!user || !user.emailVerificationTokenSentAt) {
    return res.status(401).json({ ok: false });
  }

  const sentAt = user.emailVerificationTokenSentAt.getTime();
  if (Date.now() - sentAt > TOKEN_TTL_MS) {
    return res.status(401).json({ ok: false });
  }

  await verifyUserEmail(user.id);

  return res.status(200).json({ ok: true });
}

const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute

export async function resendVerification(
  rawEmail: string
): Promise<{ ok: true }> {
  const email = normalizeEmail(rawEmail);

  const user = await authRepository.findUserByEmail(email);
  if (!user || user.emailVerifiedAt || !user.isActive) return { ok: true };

  if (user.emailVerificationTokenSentAt) {
    const last = user.emailVerificationTokenSentAt.getTime();
    if (Date.now() - last < RESEND_COOLDOWN_MS) return { ok: true };
  }

  const { tokenPlain, tokenHash } = tokenService.createEmailVerificationToken();

  await authRepository.updateUserVerificationToken(user.id, tokenHash);

  await mailService.sendVerifyEmail(user.email, {
    link: `${process.env.FRONTEND_BASE_URL}/verify-email?token=${tokenPlain}`,
  });

  return { ok: true };
}
