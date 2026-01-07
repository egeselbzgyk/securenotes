import { Router } from "express";
import {
  resendVerificationHandler,
  createAuthHandler,
  refreshHandler,
  loginHandler,
  logoutHandler,
  passwordResetConfirmHandler,
  passwordResetRequestHandler,
  passwordResetValidateHandler,
  logoutAllHandler,
  googleLoginHandler,
  googleLoginCallbackHandler,
} from "./auth.controller";
import { createRateLimiter } from "../shared/middlewares/rateLimit";
import {
  verifyEmailHandler,
  verifyEmailRedirect,
} from "./verification.service";
import { csrfGuard } from "../shared/middlewares/csrfGuard";
import { originGuard } from "../shared/middlewares/originGuard";
import { authMiddleware } from "../shared/middlewares/auth.middleware";
const router = Router();

// Register a new user
router.post(
  "/register",
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  createAuthHandler
);

// Resend verification email
router.post(
  "/resend-verification",
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  resendVerificationHandler
);

router.post(
  "/refresh",
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  originGuard,
  csrfGuard,
  refreshHandler
);
/*
Backend: Verify email with POST request (POST/auth/verify-email).
Frontend: Frontend route (/verify?token=...)
Frontend: Backend POST (/auth/verify-email)
Backend: Verify token, update database
*/

router.get(
  "/verify-email",
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  verifyEmailRedirect
);

router.post(
  "/verify-email",
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  verifyEmailHandler
);

router.post(
  "/login",
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  loginHandler
);

router.post(
  "/logout",
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  originGuard,
  csrfGuard,
  logoutHandler
);

router.post(
  "/logout-all",
  authMiddleware,
  originGuard,
  csrfGuard,
  logoutAllHandler
);

router.post(
  "/password-reset/request",
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  passwordResetRequestHandler
);

router.post(
  "/password-reset/validate",
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  passwordResetValidateHandler
);

router.post(
  "/password-reset/confirm",
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  passwordResetConfirmHandler
);

router.get(
  "/login/google",
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  googleLoginHandler
);

router.get(
  "/login/google/callback",
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  googleLoginCallbackHandler
);
  
export default router;
