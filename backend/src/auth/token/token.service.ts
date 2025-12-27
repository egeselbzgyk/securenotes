import crypto from "crypto";
import { SignJWT } from "jose";
import { TextEncoder } from "util";
import { ACCESS_TOKEN_TTL_SECONDS } from "./token.config";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is missing");

const jwtKey = new TextEncoder().encode(JWT_SECRET);

export const tokenService = {
  // ---- common ----
  hashToken(tokenPlain: string) {
    return crypto.createHash("sha256").update(tokenPlain).digest("hex");
  },

  // ---- email verification ----
  createEmailVerificationToken() {
    const tokenPlain = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(tokenPlain);
    return { tokenPlain, tokenHash };
  },

  // ---- refresh token (cookie + DB session) ----
  createRefreshToken() {
    const tokenPlain = crypto.randomBytes(48).toString("base64url");
    const tokenHash = this.hashToken(tokenPlain);
    return { tokenPlain, tokenHash };
  },

  // ---- access token (JWT) ----
  async createAccessToken(params: { userId: string; sessionId: string }) {
    const { userId, sessionId } = params;

    return new SignJWT({
      sid: sessionId,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
      .sign(jwtKey);
  },

  createPasswordResetToken() {
    const tokenPlain = crypto.randomBytes(48).toString("base64url");
    const tokenHash = this.hashToken(tokenPlain);
    return { tokenPlain, tokenHash };
  },
};
