import { prisma } from "../lib/prisma";
import { passwordService } from "./password.service";
import {
  authRepository,
  createOAuthState,
  findAndConsumeOAuthState,
  cleanupExpiredOAuthStates,
} from "./auth.repository";
import { LoginDto, RegisterDto } from "./auth.types";
import { tokenService } from "./token/token.service";
import { AuthError } from "./auth.errors";
import { mailService } from "../shared/services/mailService";
import { normalizeEmail } from "../shared/utils/normalizeEmail";
import { REFRESH_TOKEN_TTL_SECONDS } from "./token/token.config";
import { sessionRepository } from "./session.repository";
import { resetRepository } from "./reset/reset.repository";
import { OAuth2Client } from "google-auth-library";
import crypto from "node:crypto";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

type RefreshInput = {
  refreshTokenPlain: string;
  userAgent?: string | null;
  ip?: string | null;
};

type RefreshOutput = {
  accessToken: string;
  newRefreshTokenPlain: string;
};

const MAX_FAILED_ATTEMPTS = 10;
const LOCK_MS = 15 * 60 * 1000; // 15 minutes
const RESET_TTL_MS = 30 * 60 * 1000; // 30 minutes

export const authService = {
  async register(dto: RegisterDto) {
    const email = normalizeEmail(dto.email);

    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) {
      throw AuthError.conflict("EMAIL_ALREADY_IN_USE");
    }

    // Assert strong password
    passwordService.assertStrong(dto.password, { userInputs: [email] });
    const passwordHash = await passwordService.hash(dto.password);

    const result = await prisma.$transaction(async (tx) => {
      const user = await authRepository.createUser(tx, {
        email,
        emailVerifiedAt: null,
        passwordHash,
      });

      await authRepository.createIdentity(tx, {
        user: {
          connect: {
            id: user.id,
          },
        },
        provider: "LOCAL",
        providerId: user.id,
      });

      const { tokenPlain, tokenHash } =
        tokenService.createEmailVerificationToken();
      const updatedUser = await authRepository.updateUserVerificationToken(
        user.id,
        tokenHash,
        tx
      );

      return { user: updatedUser, tokenPlain };
    });

    await mailService.sendVerifyEmail(result.user.email, {
      link: `${process.env.FRONTEND_BASE_URL}/verify-email?token=${result.tokenPlain}`,
    });

    return {
      id: result.user.id,
      email: result.user.email,
      token: result.tokenPlain,
      emailVerified: !!result.user.emailVerifiedAt,
    };
  },

  async refresh(input: RefreshInput): Promise<RefreshOutput> {
    const { refreshTokenPlain, userAgent, ip } = input;

    if (!refreshTokenPlain) {
      throw AuthError.unauthorized("UNAUTHORIZED");
    }

    const refreshTokenHash = tokenService.hashToken(refreshTokenPlain);

    const session = await sessionRepository.findByRefreshTokenHash(
      refreshTokenHash
    );

    if (!session) {
      throw AuthError.unauthorized("UNAUTHORIZED");
    }

    // if session is revoked or expired
    const nowMs = Date.now();
    if (session.revokedAt !== null || session.expiresAt.getTime() <= nowMs) {
      throw AuthError.unauthorized("UNAUTHORIZED");
    }

    // This check detects reuse of a stolen refresh token and immediately locks all sessions of the account;
    // it is a strong security advantage of the stateful refresh model.
    if (session.rotatedAt !== null) {
      // if rotated: possible token reuse attack
      await sessionRepository.revokeAllForUser(session.userId);
      throw AuthError.unauthorized("UNAUTHORIZED");
    }

    // user conditions
    const user = session.user;
    if (!user.isActive) {
      // if account is deactivated: close session as well
      await sessionRepository.revokeSession(session.id);
      throw AuthError.unauthorized("UNAUTHORIZED");
    }

    // if password changed: old sessions are invalid
    if (
      user.passwordChangedAt &&
      user.passwordChangedAt.getTime() > session.createdAt.getTime()
    ) {
      await sessionRepository.revokeAllForUser(user.id);
      throw AuthError.unauthorized("UNAUTHORIZED");
    }

    // rotation: new refresh token + new session + mark old session as rotated
    const { tokenPlain: newRefreshTokenPlain, tokenHash: newRefreshTokenHash } =
      tokenService.createRefreshToken();

    const newExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000
    );

    const newSession = await sessionRepository.rotateSession({
      oldSessionId: session.id,
      userId: user.id,
      newRefreshTokenHash,
      newExpiresAt,
      userAgent,
      ip,
    });

    const accessToken = await tokenService.createAccessToken({
      userId: user.id,
      sessionId: newSession.id,
    });

    return {
      accessToken,
      newRefreshTokenPlain,
    };
  },

  async login(dto: LoginDto) {
    const now = new Date();
    const email = normalizeEmail(dto.email);
    const user = await authRepository.findUserByEmail(email);

    if (!user) throw AuthError.unauthorized("INVALID_CREDENTIALS");

    if (user.lockedUntil && user.lockedUntil.getTime() > now.getTime())
      throw AuthError.unauthorized("INVALID_CREDENTIALS");

    if (!user.isActive) throw AuthError.unauthorized("INVALID_CREDENTIALS");

    if (user.emailVerifiedAt === null)
      throw AuthError.unauthorized("EMAIL_NOT_VERIFIED");

    const passwordValid = await passwordService.verify(
      user.passwordHash,
      dto.password
    );
    if (!passwordValid) {
      const failed = (user.failedLoginAttempts ?? 0) + 1;

      const shouldLock = failed >= MAX_FAILED_ATTEMPTS;
      await authRepository.updateLoginFailure(user.id, {
        failedLoginAttempts: failed,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCK_MS) : null,
      });

      throw AuthError.unauthorized("INVALID_CREDENTIALS");
    }

    // Reset failed attempts on successful login
    await authRepository.updateLoginSuccess(user.id);

    const { tokenPlain: refreshTokenPlain, tokenHash: refreshTokenHash } =
      tokenService.createRefreshToken();

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
    const session = await sessionRepository.createSession({
      userId: user.id,
      refreshTokenHash,
      expiresAt,
      userAgent: dto.userAgent ?? null,
      ip: dto.ip ?? null,
    });

    const accessToken = await tokenService.createAccessToken({
      userId: user.id,
      sessionId: session.id,
    });

    return { ok: true as const, accessToken, refreshTokenPlain };
  },

  async logout(refreshTokenPlain: string | undefined) {
    if (!refreshTokenPlain) {
      return { ok: true as const };
    }

    const refreshTokenHash = tokenService.hashToken(refreshTokenPlain);

    const session = await sessionRepository.findByRefreshTokenHash(
      refreshTokenHash
    );
    if (session) {
      await sessionRepository.revokeSession(session.id);
    }
    return { ok: true as const };
  },

  async requestPasswordReset(input: {
    email: string;
    ip?: string | null;
    userAgent?: string | null;
  }) {
    const email = normalizeEmail(input.email);
    const user = await authRepository.findUserByEmail(email);

    if (!user || !user.isActive) return { ok: true as const };

    const { tokenPlain, tokenHash } = tokenService.createPasswordResetToken();
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);

    await resetRepository.createToken({
      userId: user.id,
      tokenHash,
      expiresAt,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
    });

    await mailService.sendResetPasswordEmail(user.email, {
      link: `${process.env.FRONTEND_URL}/reset-password?token=${tokenPlain}`,
    });
    return { ok: true as const };
  },

  async validateResetToken(tokenPlain: string) {
    const tokenHash = tokenService.hashToken(tokenPlain);
    const record = await resetRepository.findByHash(tokenHash);

    if (!record) throw AuthError.unauthorized("INVALID_TOKEN");
    if (record.usedAt) throw AuthError.unauthorized("TOKEN_ALREADY_USED");
    if (record.expiresAt.getTime() <= Date.now())
      throw AuthError.unauthorized("TOKEN_EXPIRED");
    if (!record.user.isActive) throw AuthError.unauthorized("USER_INACTIVE");

    return { ok: true as const };
  },

  async confirmPasswordReset(input: {
    tokenPlain: string;
    newPassword: string;
  }) {
    const tokenHash = tokenService.hashToken(input.tokenPlain);
    const record = await resetRepository.findByHash(tokenHash);

    if (!record) throw AuthError.unauthorized("UNAUTHORIZED");
    if (record.usedAt) throw AuthError.unauthorized("UNAUTHORIZED");
    if (record.expiresAt.getTime() <= Date.now())
      throw AuthError.unauthorized("UNAUTHORIZED");
    if (!record.user.isActive) throw AuthError.unauthorized("UNAUTHORIZED");

    const newHash = await passwordService.hash(input.newPassword);

    await authRepository.updatePassword(record.userId, {
      passwordHash: newHash,
      passwordChangedAt: new Date(),
    });

    await sessionRepository.revokeAllForUser(record.userId);
    await resetRepository.markUsed(record.id);
    await resetRepository.deleteAllForUser(record.userId);

    return { ok: true as const };
  },

  async logoutAll(userId: string) {
    await sessionRepository.revokeAllForUser(userId);
    return { ok: true as const };
  },

  async getGoogleAuthUrl() {
    // Generate secure random state for CSRF protection
    const state = crypto.randomBytes(32).toString("hex");

    // Store state in database with expiration
    await createOAuthState(state, "GOOGLE", {
      ip: null, // Request metadata will be added if needed
      userAgent: null,
    });

    return googleClient.generateAuthUrl({
      access_type: "offline",
      scope: [
        "openid",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      prompt: "consent",
      state: state, // Include state parameter
    });
  },

  async loginWithGoogle(
    code: string,
    state: string,
    meta: { userAgent?: string; ip?: string }
  ) {
    // Verify state parameter for CSRF protection
    const oAuthState = await findAndConsumeOAuthState(state);
    if (!oAuthState) {
      throw AuthError.unauthorized("INVALID_OR_EXPIRED_STATE");
    }

    // Verify provider matches
    if (oAuthState.provider !== "GOOGLE") {
      throw AuthError.unauthorized("INVALID_STATE_PROVIDER");
    }

    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw AuthError.unauthorized("INVALID_GOOGLE_TOKEN");
    }

    const { email, sub: googleId } = payload;
    const normalizedEmail = normalizeEmail(email);

    // Transaction to find/create user and log them in
    return await prisma.$transaction(async (tx) => {
      // 1. Try to find by Identity
      let user = await tx.user.findFirst({
        where: {
          identities: {
            some: {
              provider: "GOOGLE",
              providerId: googleId,
            },
          },
        },
      });

      // 2. If not found, try to find by Email to link account
      if (!user) {
        user = await authRepository.findUserByEmail(normalizedEmail, tx);

        if (user) {
          // Link account
          await authRepository.createIdentity(tx, {
            user: { connect: { id: user.id } },
            provider: "GOOGLE",
            providerId: googleId,
          });
        } else {
          // 3. Create new user
          const passwordHash = await passwordService.hash(
            Math.random().toString(36).slice(-8) +
              Math.random().toString(36).slice(-8)
          ); // Random password for oauth users

          user = await authRepository.createUser(tx, {
            email: normalizedEmail,
            emailVerifiedAt: new Date(), // Verified by Google
            passwordHash,
          });

          await authRepository.createIdentity(tx, {
            user: { connect: { id: user.id } },
            provider: "GOOGLE",
            providerId: googleId,
          });
        }
      }

      // 4. Create Session (Login)
      if (!user.isActive) throw AuthError.unauthorized("USER_INACTIVE");

      const { tokenPlain: refreshTokenPlain, tokenHash: refreshTokenHash } =
        tokenService.createRefreshToken();

      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
      const session = await sessionRepository.createSession(
        {
          userId: user.id,
          refreshTokenHash,
          expiresAt,
          userAgent: meta.userAgent ?? null,
          ip: meta.ip ?? null,
        },
        tx
      );

      const accessToken = await tokenService.createAccessToken({
        userId: user.id,
        sessionId: session.id,
      });

      return { accessToken, refreshTokenPlain };
    });
  },

  // Cleanup expired OAuth states (should be called periodically)
  async cleanupExpiredOAuthStates() {
    await cleanupExpiredOAuthStates();
  },
};
