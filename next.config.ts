/**
 * Configuration Next.js 16.
 *
 * - cacheComponents + partialPrefetching : nouveau modèle de rendu de Next 16.
 *   Tout est pré-rendu par défaut ; ce qui dépend de la requête (session, cookies)
 *   doit être placé derrière un <Suspense> et sera streamé.
 * - typedRoutes : les `href` des <Link> sont vérifiés par TypeScript.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,

  async redirects() {
    // /app n'a pas de page propre : on ouvre directement le planning.
    return [{ source: "/app", destination: "/app/planning", permanent: false }];
  },

  turbopack: {
    rules: {
      // Tailwind CSS v4 traité par son loader Turbopack dédié.
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
