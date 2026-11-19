/**
 * Route API de Better Auth (/api/auth/*).
 * Sert notamment le lien de réinitialisation du mot de passe envoyé par email.
 * Les formulaires de l'app passent eux par des Server Actions (src/features/auth/actions.ts).
 */
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
