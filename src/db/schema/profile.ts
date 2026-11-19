/**
 * Table `profile` : données personnelles et physiques de l'utilisateur (1 profil par compte).
 *
 * Données de santé (poids, taille…) : accès strictement limité au propriétaire,
 * toujours filtré par `userId` côté serveur.
 *
 * Le profil est créé à la 1re étape de l'onboarding (prénom) ; les données physiques
 * sont donc nullables jusqu'à l'étape 2. `onboardingCompletedAt` marque la fin
 * de l'onboarding (ajout par rapport au brief, nécessaire pour savoir où rediriger).
 */
import { date, doublePrecision, integer, pgEnum, pgTable, smallint, text, timestamp } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { user } from "./auth";

/** Sexe biologique : utilisé uniquement par la formule de Mifflin-St Jeor. */
export const sexEnum = pgEnum("sex", ["male", "female"]);

/** Niveau d'activité → coefficient multiplicateur du métabolisme de base. */
export const activityLevelEnum = pgEnum("activity_level", [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
]);

/** Objectif → ajustement du besoin calorique (−15 % / 0 / +10 %). */
export const goalEnum = pgEnum("goal", ["lose", "maintain", "gain"]);

export const themeEnum = pgEnum("theme", ["light", "dark", "system"]);

export const profile = pgTable("profile", {
  id: id(),
  userId: text()
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  firstName: text().notNull(),
  /** Date de naissance au format ISO "AAAA-MM-JJ" (l'âge est calculé, jamais stocké). */
  birthDate: date({ mode: "string" }),
  sex: sexEnum(),
  heightCm: smallint(),
  weightKg: doublePrecision(),
  activityLevel: activityLevelEnum(),
  goal: goalEnum(),
  /** Besoin calorique saisi à la main ; remplace la valeur calculée s'il est renseigné. */
  dailyKcalOverride: integer(),
  theme: themeEnum().default("system").notNull(),
  onboardingCompletedAt: timestamp({ withTimezone: true }),
  ...timestamps,
});

export type Profile = typeof profile.$inferSelect;
