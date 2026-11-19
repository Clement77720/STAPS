/**
 * Colonnes communes réutilisées par les tables métier.
 *
 * Les noms SQL sont générés automatiquement en snake_case (option `casing`
 * de Drizzle), on n'écrit donc que les noms TypeScript en camelCase.
 */
import { timestamp, uuid } from "drizzle-orm/pg-core";

/** Clé primaire UUID générée par PostgreSQL. */
export const id = () => uuid().primaryKey().defaultRandom();

/** Horodatages de création / mise à jour (avec fuseau horaire). */
export const timestamps = {
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};
