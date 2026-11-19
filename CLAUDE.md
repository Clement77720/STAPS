@AGENTS.md

# Conventions du projet

- Le brief complet est dans `PROJET.md` : le relire avant chaque phase, avancer phase par phase.
- Interface en français ; commentaires pertinents (rôle des fichiers, logique métier), pas de commentaires triviaux.
- Server Components par défaut ; mutations via Server Actions validées avec Zod.
- Chaque requête BDD filtre par le `userId` de la session (jamais un id venant du client) :
  passer par `requireUser()` / `requireOnboardedUser()` de `src/lib/dal.ts`.
- Server Actions : retourner un `ActionResult` (`src/lib/action-result.ts`) ; formulaires avec
  `FormField` (`src/components/form/`) + `zodResolver` sur le même schéma que l'action.
- Toute action vérifiant un secret (mot de passe…) doit appeler `checkRateLimits` (`src/lib/rate-limit.ts`).
- Après modification du schéma Drizzle : `npm run db:generate` puis `npm run db:migrate`.
- Code métier par feature dans `src/features/{auth,profil,planning,bien-etre,repas}/`.
- Formules de santé dans `src/lib/calculs.ts`, testées dans `calculs.test.ts` (`npm test`).
- Cache Components est activé : tout accès à la session/aux cookies doit être derrière un `<Suspense>`.
- Couleurs : utiliser les tokens de `src/app/globals.css` (voir README § Design system).
