@AGENTS.md

# Conventions du projet

- Le brief complet est dans `PROJET.md` : le relire avant chaque phase, avancer phase par phase.
- Interface en français ; commentaires pertinents (rôle des fichiers, logique métier), pas de commentaires triviaux.
- Server Components par défaut ; mutations via Server Actions validées avec Zod.
- Chaque requête BDD filtre par le `userId` de la session (jamais un id venant du client).
- Code métier par feature dans `src/features/{planning,bien-etre,repas}/`.
- Cache Components est activé : tout accès à la session/aux cookies doit être derrière un `<Suspense>`.
- Couleurs : utiliser les tokens de `src/app/globals.css` (voir README § Design system).
