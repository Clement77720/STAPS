/**
 * Traduction des codes d'erreur de Better Auth en messages français.
 */
import { isAPIError } from "better-auth/api";

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe incorrect.",
  INVALID_PASSWORD: "Mot de passe incorrect.",
  USER_ALREADY_EXISTS: "Un compte existe déjà avec cette adresse email.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Un compte existe déjà avec cette adresse email.",
  PASSWORD_TOO_SHORT: "Mot de passe trop court (8 caractères minimum).",
  PASSWORD_TOO_LONG: "Mot de passe trop long (128 caractères maximum).",
  INVALID_TOKEN: "Ce lien a expiré ou a déjà été utilisé. Refais une demande.",
  TOKEN_EXPIRED: "Ce lien a expiré. Refais une demande.",
  SIGN_UP_NOT_ALLOWED: "Les inscriptions sont fermées pour cette adresse email.",
  SESSION_EXPIRED: "Ta session a expiré, reconnecte-toi puis réessaie.",
};

/** Message à afficher pour une erreur levée par `auth.api.*`. Relance les erreurs inconnues. */
export function authErrorMessage(error: unknown): string {
  if (isAPIError(error)) {
    if (error.status === 429) return "Trop de tentatives. Patiente une minute avant de réessayer.";
    const code = (error.body as { code?: string } | undefined)?.code;
    if (code && MESSAGES[code]) return MESSAGES[code];
    return "Une erreur est survenue. Réessaie dans un instant.";
  }
  throw error;
}
