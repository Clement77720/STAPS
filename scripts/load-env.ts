/**
 * Charge les variables d'environnement pour les scripts CLI (tsx),
 * avec la même priorité que Next.js : .env.local puis .env.
 * À importer EN PREMIER dans chaque script.
 */
import { config } from "dotenv";

config({ path: [".env.local", ".env"], quiet: true });
