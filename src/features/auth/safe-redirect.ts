/**
 * Valide le paramètre `?next=` utilisé pour revenir sur une page après connexion.
 * N'accepte que les chemins internes de l'app (/app/...) afin d'éviter les
 * "open redirects" vers un site externe (ex. next=//site-malveillant.com).
 */
import type { Route } from "next";

export function safeNextPath(next: unknown): Route | null {
  if (typeof next !== "string") return null;
  if (!next.startsWith("/app/") || next.startsWith("//") || next.includes("\\")) return null;
  return next as Route;
}
