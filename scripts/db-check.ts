/**
 * db-check — vérifie que la connexion à la base fonctionne.
 * Usage : npm run db:check
 */
import "./load-env";

async function main() {
  // Import dynamique : le module lit DATABASE_URL au chargement, donc après load-env.
  const { db } = await import("@/db");
  const { sql } = await import("drizzle-orm");

  const started = Date.now();
  const result = await db.execute<{ version: string }>(sql`select version()`);
  const host = new URL(process.env.DATABASE_URL!).hostname;

  console.log(`✅ Connexion OK à ${host} (${Date.now() - started} ms)`);
  console.log(`   ${result.rows[0]?.version}`);
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error("❌ Connexion impossible :", error instanceof Error ? error.message : error);
  process.exit(1);
});
