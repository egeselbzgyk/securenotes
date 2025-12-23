import { Request, Response } from "express";
import {
  authRepository,
  findUserByEmailVerificationToken,
  verifyUserEmail,
} from "./auth.repository";
import { tokenService } from "./token.service";
import { mailService } from "../shared/services/mailService";
import { resendSchema, verifySchema } from "./auth.schema";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export async function verifyEmail(req: Request, res: Response) {
  const { token } = verifySchema.parse(req.query);

  const frontendBase = process.env.FRONTEND_BASE_URL ?? "http://localhost";

  if (!token) {
    return res.redirect(302, `${frontendBase}/verify-failed`);
  }

  const tokenHash = tokenService.hashToken(token);

  const user = await findUserByEmailVerificationToken(tokenHash);

  if (!user || !user.emailVerificationTokenSentAt) {
    return res.redirect(302, `${frontendBase}/verify-failed`);
  }

  const sentAt = user.emailVerificationTokenSentAt.getTime();
  if (Date.now() - sentAt > TOKEN_TTL_MS) {
    return res.redirect(302, `${frontendBase}/verify-failed`);
  }

  await verifyUserEmail(user.id);

  return res.redirect(302, `${frontendBase}/verified`);
}

const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute

export async function resendVerification(req: Request, res: Response) {
  const { email } = resendSchema.parse(req.body);

  const user = await authRepository.findUserByEmail(email);
  if (!user || user.emailVerifiedAt || !user.isActive)
    return res.json({ ok: true });

  if (user.emailVerificationTokenSentAt) {
    const last = user.emailVerificationTokenSentAt.getTime();
    if (Date.now() - last < RESEND_COOLDOWN_MS) return res.json({ ok: true });
  }

  const { tokenPlain, tokenHash } = tokenService.createEmailVerificationToken();

  await authRepository.updateUserVerificationToken(user.id, tokenHash);

  await mailService.sendVerifyEmail(user.email, {
    name: user.name,
    link: `${process.env.API_BASE_URL}/auth/verify-email?token=${tokenPlain}`,
  });

  return res.json({ ok: true });
}
