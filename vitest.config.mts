/**
 * Configuration Vitest (tests unitaires des fonctions métier).
 * Les tests sont colocalisés avec le code : `*.test.ts`.
 */
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Même alias que tsconfig.json : "@/..." → "src/..."
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
