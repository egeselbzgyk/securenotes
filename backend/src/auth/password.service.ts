import argon2 from "argon2";
import zxcvbn from "zxcvbn";
import { AuthError } from "./auth.errors";

export const passwordService = {
  assertStrong(password: string, opts: { userInputs: string[] }) {
    // basic min/max is already in Zod; here the policy
    const r = zxcvbn(password, opts.userInputs);
    if (r.score < 3) throw AuthError.badRequest("WEAK_PASSWORD");
  },

  async hash(password: string) {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
  },

  async verify(hash: string, password: string) {
    return argon2.verify(hash, password);
  },
};
