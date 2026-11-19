/**
 * Tables du planning.
 *
 * Phase 1 : `calendar_source` seulement, pour mémoriser l'URL iCal saisie pendant
 * l'onboarding. La table `event` et la synchronisation arrivent en Phase 2.
 */
import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { user } from "./auth";

export const calendarSourceTypeEnum = pgEnum("calendar_source_type", ["url", "file"]);

export const calendarSource = pgTable(
  "calendar_source",
  {
  id: id(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: calendarSourceTypeEnum().notNull(),
  /** URL iCal (.ics) exportée depuis ADE / l'ENT — uniquement si type = "url". */
  url: text(),
  /** Dernière synchronisation réussie (null = jamais synchronisé). */
  lastSyncedAt: timestamp({ withTimezone: true }),
  ...timestamps,
  },
  (table) => [index("calendar_source_user_id_idx").on(table.userId)],
);
