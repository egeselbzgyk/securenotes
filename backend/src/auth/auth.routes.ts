import { Router } from "express";
import { createAuthHandler } from "./auth.controller";
import { resendVerification, verifyEmail } from "./verification.service";
import { createRateLimiter } from "../middlewares/rateLimit";

const router = Router();

// Register a new user
router.post(
  "/register",
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  createAuthHandler
);

// Verify email
router.post(
  "/verify-email",
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  verifyEmail
);

// Resend verification email
router.post(
  "/resend-verification",
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  resendVerification
);

router.get(
  "/verify-email",
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  verifyEmail
);

export default router;
