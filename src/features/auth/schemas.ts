/**
 * Schémas Zod des formulaires d'authentification.
 * Partagés entre le client (react-hook-form) et les Server Actions (revalidation).
 */
import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { error: "Indique ton adresse email." })
  .pipe(z.email({ error: "Adresse email invalide." }));

/** Mêmes bornes que la config Better Auth (src/lib/auth.ts). */
const newPassword = z
  .string()
  .min(8, { error: "8 caractères minimum." })
  .max(128, { error: "128 caractères maximum." });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Indique ton mot de passe." }),
});

export const registerSchema = z
  .object({ email, password: newPassword, confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ token: z.string().min(1), password: newPassword, confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
