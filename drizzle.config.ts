/**
 * Configuration drizzle-kit (génération et application des migrations SQL).
 *
 * Commandes (cf. package.json) :
 *  - npm run db:generate → crée un fichier de migration dans ./drizzle à partir du schéma
 *  - npm run db:migrate  → applique les migrations en attente sur DATABASE_URL
 *  - npm run db:studio   → interface web pour explorer la base
 */
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Mêmes fichiers que Next.js : .env.local est prioritaire sur .env.
config({ path: [".env.local", ".env"], quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL est manquante (voir .env.example).");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL },
  // Doit correspondre à l'option `casing` de src/db/index.ts.
  casing: "snake_case",
  strict: true,
  verbose: true,
});
