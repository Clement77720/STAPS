/**
 * Table `rate_limit` : compteurs de tentatives pour limiter le brute-force
 * (connexion, inscription, mot de passe oublié…), cf. src/lib/rate-limit.ts.
 *
 * Stockée en BDD (et non en mémoire) car, en serverless, chaque requête peut
 * arriver sur une instance différente. Table technique : pas de `userId`,
 * la clé contient le type d'action + l'IP, l'email ou l'id concerné.
 */
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const rateLimit = pgTable("rate_limit", {
  key: text().primaryKey(),
  count: integer().notNull(),
  windowStart: timestamp({ withTimezone: true }).notNull(),
});
