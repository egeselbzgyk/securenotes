import { prisma } from "../lib/prisma";
import { passwordService } from "./password.service";
import { authRepository } from "./auth.repository";
import { RegisterDto } from "./auth.types";
import { tokenService } from "./token.service";
import { AuthError } from "./auth.errors";
import { mailService } from "../shared/services/mailService";

export const authService = {
  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const name = dto.name.trim();

    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) {
      throw AuthError.conflict("EMAIL_ALREADY_IN_USE");
    }

    // Assert strong password
    passwordService.assertStrong(dto.password, { userInputs: [email, name] });
    const passwordHash = await passwordService.hash(dto.password);

    const result = await prisma.$transaction(async (tx) => {
      const user = await authRepository.createUser(tx, {
        email,
        name,
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
      name: result.user.name,
      link: `${process.env.API_BASE_URL}/auth/verify-email?token=${result.tokenPlain}`,
    });

    return {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      token: result.tokenPlain,
      emailVerified: !!result.user.emailVerifiedAt,
      ...(process.env.NODE_ENV !== "production"
        ? { token: result.tokenPlain }
        : {}),
    };
  },
};
