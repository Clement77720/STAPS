/**
 * Tables d'authentification attendues par Better Auth (user, session, account, verification).
 *
 * Structure générée à partir du générateur de schéma de l'adaptateur Drizzle de
 * Better Auth (v1.7), puis adaptée : horodatages avec fuseau horaire et noms SQL
 * produits par l'option `casing: "snake_case"`.
 * ⚠️ Ne pas renommer les propriétés : Better Auth s'appuie sur ces noms.
 */
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

const createdAt = () => timestamp({ withTimezone: true }).defaultNow().notNull();
const updatedAt = () =>
  timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull();

export const user = pgTable("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().default(false).notNull(),
  image: text(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable(
  "session",
  {
    id: text().primaryKey(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    token: text().notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    /** Hash du mot de passe (scrypt) pour le fournisseur "credential". */
    password: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

/** Jetons temporaires (ex. réinitialisation du mot de passe). */
export const verification = pgTable(
  "verification",
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);
