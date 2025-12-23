import crypto from "node:crypto";

export const tokenService = {
  createEmailVerificationToken() {
    const tokenPlain = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(tokenPlain);
    return { tokenPlain, tokenHash };
  },
  hashToken(tokenPlain: string) {
    return crypto.createHash("sha256").update(tokenPlain).digest("hex");
  },
};
