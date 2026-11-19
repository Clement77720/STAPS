/**
 * action-result.ts — Format de retour commun des Server Actions.
 *
 * Les actions ne lèvent pas d'exception pour les erreurs "attendues"
 * (mot de passe incorrect, champ invalide…) : elles renvoient un objet que
 * le formulaire affiche. Les erreurs inattendues remontent normalement.
 */
import { z } from "zod";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export function ok(): ActionResult;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T): ActionResult<T | undefined> {
  return { ok: true, data };
}

export function fail(error: string, fieldErrors?: Record<string, string[] | undefined>): { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> } {
  return { ok: false, error, fieldErrors };
}

/** Résultat d'échec à partir d'une validation Zod ratée côté serveur. */
export function invalid(error: z.ZodError) {
  const { fieldErrors } = z.flattenError(error);
  return fail("Certains champs sont invalides.", fieldErrors as Record<string, string[] | undefined>);
}
