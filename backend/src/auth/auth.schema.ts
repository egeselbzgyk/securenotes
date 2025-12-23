import { z } from "zod";
import { isDisposableEmail } from "disposable-email-domains-js";

export const passwordSchema = z
  .string()
  .min(8, { message: "Passwort muss mindestens 8 Zeichen lang sein." })
  .max(64, { message: "Passwort muss höchstens 64 Zeichen lang sein." })
  .refine((password) => /[A-Z]/.test(password), {
    message: "Passwort muss mindestens ein Großbuchstaben enthalten.",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "Passwort muss mindestens ein Kleinbuchstaben enthalten.",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "Passwort muss mindestens eine Zahl enthalten.",
  })
  .refine((password) => /[-+!@#$%^&*]/.test(password), {
    message: "Passwort muss mindestens ein Sonderzeichen enthalten.",
  });

/* TO-DO
export const updatePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein.",
    path: ["confirmPassword"],
  })
  .strict();
  */

export const nameSchema = z
  .string()
  .min(6, { message: "Name muss mindestens 6 Zeichen lang sein." })
  .max(32, { message: "Name muss höchstens 32 Zeichen lang sein." })
  .regex(/^[a-zA-Z0-9]+$/, {
    message: "Name darf nur Buchstaben und Zahlen enthalten.",
  });

function extractDomain(email: string) {
  const i = email.lastIndexOf("@");
  return i === -1 ? "" : email.slice(i + 1);
}

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(6, { message: "E-Mail ist zu kurz." })
  .max(254, { message: "E-Mail ist zu lang." })
  .pipe(z.email({ message: "Ungültige E-Mail-Adresse." }))
  .refine(
    (email) => {
      return !isDisposableEmail(extractDomain(email));
    },
    {
      message: "Ungültige E-Mail-Adresse.",
    }
  );

export const createAuthSchema = z
  .object({
    email: emailSchema,
    name: nameSchema,
    password: passwordSchema,
  })
  .strict();

export const resendSchema = z.object({
  email: z
    .string()
    .max(254)
    .pipe(z.email({ message: "Ungültige E-Mail-Adresse." })),
});

export const verifySchema = z.object({
  token: z.string().length(64),
});
