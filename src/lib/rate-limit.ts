/**
 * rate-limit.ts — Limitation du nombre de tentatives (anti brute-force).
 *
 * Pourquoi ici ? Better Auth limite ses routes HTTP, mais pas les appels
 * `auth.api.*` faits depuis nos Server Actions. On applique donc nos propres
 * limites dans chaque action sensible (cf. src/features/auth/actions.ts).
 *
 * Algorithme "fenêtre fixe", en UNE requête SQL atomique (pas de course entre
 * deux requêtes simultanées) :
 *  - première tentative → ligne créée avec count = 1 ;
 *  - fenêtre expirée → compteur remis à 1 et nouvelle fenêtre ;
 *  - sinon → count + 1.
 * Si le compteur dépasse `max`, la tentative est refusée.
 */
import "server-only";
import { inArray, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { rateLimit } from "@/db/schema";

export type RateLimitRule = { max: number; windowSeconds: number };

/** Règles par action (fenêtres volontairement larges pour un usage normal). */
export const RATE_LIMITS = {
  loginPerEmail: { max: 10, windowSeconds: 15 * 60 },
  loginPerIp: { max: 30, windowSeconds: 15 * 60 },
  registerPerIp: { max: 5, windowSeconds: 60 * 60 },
  forgotPerEmail: { max: 3, windowSeconds: 15 * 60 },
  forgotPerIp: { max: 10, windowSeconds: 60 * 60 },
  resetPerIp: { max: 10, windowSeconds: 15 * 60 },
  deleteAccountPerUser: { max: 5, windowSeconds: 15 * 60 },
} satisfies Record<string, RateLimitRule>;

/** Enregistre une tentative ; `allowed: false` si la limite est dépassée. */
export async function consumeRateLimit(key: string, rule: RateLimitRule) {
  const window = sql.raw(`interval '${Math.floor(rule.windowSeconds)} seconds'`);
  const result = await db.execute<{ count: number; window_start: Date }>(sql`
    insert into rate_limit (key, count, window_start) values (${key}, 1, now())
    on conflict (key) do update set
      count = case when rate_limit.window_start < now() - ${window} then 1 else rate_limit.count + 1 end,
      window_start = case when rate_limit.window_start < now() - ${window} then now() else rate_limit.window_start end
    returning count, window_start
  `);

  // Ménage occasionnel des compteurs expirés (≈ 1 appel sur 50), pour que la table reste petite.
  if (Math.random() < 0.02) {
    await db.execute(sql`delete from rate_limit where window_start < now() - interval '1 day'`);
  }

  const row = result.rows[0];
  const windowEnd = new Date(row.window_start).getTime() + rule.windowSeconds * 1000;
  return {
    allowed: row.count <= rule.max,
    retryAfterSeconds: Math.max(0, Math.ceil((windowEnd - Date.now()) / 1000)),
  };
}

/** Vérifie plusieurs limites ; renvoie le message d'erreur à afficher, ou null si tout est OK. */
export async function checkRateLimits(checks: { key: string; rule: RateLimitRule }[]): Promise<string | null> {
  for (const { key, rule } of checks) {
    const { allowed, retryAfterSeconds } = await consumeRateLimit(key, rule);
    if (!allowed) {
      const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
      return `Trop de tentatives. Réessaie dans ${minutes} minute${minutes > 1 ? "s" : ""}.`;
    }
  }
  return null;
}

/**
 * Adresse IP du client. Sur Vercel, `x-forwarded-for` est renseigné par la
 * plateforme (première valeur = client). En local, elle peut être absente.
 */
export async function clientIp(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

/** Supprime des compteurs (ex. après une connexion réussie ou la suppression du compte). */
export async function resetRateLimits(keys: string[]) {
  if (keys.length > 0) await db.delete(rateLimit).where(inArray(rateLimit.key, keys));
}
