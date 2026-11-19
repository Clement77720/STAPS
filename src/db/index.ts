/**
 * Client base de données (PostgreSQL via Drizzle ORM).
 *
 * Driver : `pg` (node-postgres) avec un pool de connexions.
 *  - En production, DATABASE_URL pointe vers l'URL *poolée* de Neon
 *    (hôte en `-pooler`), adaptée aux fonctions serverless de Vercel.
 *  - En local, n'importe quel PostgreSQL fonctionne (Neon, Docker, installation locale).
 *
 * `attachDatabasePool` (Vercel Fluid Compute) ferme proprement les connexions
 * inactives avant la mise en veille d'une instance ; c'est sans effet hors Vercel.
 *
 * ⚠️ Module serveur uniquement : ne jamais l'importer depuis un composant "use client".
 * (Pas de `import "server-only"` ici, car les scripts CLI — seed, db:check — l'utilisent aussi.)
 */
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL est manquante. Copie .env.example en .env.local et renseigne l'URL de ta base Neon.",
  );
}

/*
 * En développement, le rechargement à chaud ré-exécute ce module : on garde le pool
 * sur `globalThis` pour ne pas ouvrir un nouveau pool (et de nouvelles connexions)
 * à chaque modification de fichier.
 */
const globalForDb = globalThis as unknown as { pgPool?: Pool };

const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString,
    // Petit pool : chaque instance serverless n'a besoin que de quelques connexions.
    max: 5,
    idleTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool;
attachDatabasePool(pool);

export const db = drizzle({
  client: pool,
  schema,
  // Propriétés TypeScript en camelCase (userId) ↔ colonnes SQL en snake_case (user_id).
  casing: "snake_case",
});

export type Db = typeof db;
