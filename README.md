# STAPS — Emploi du temps, bien-être & repas

Application web personnelle (mobile first) pour un·e étudiant·e en STAPS :
planning des cours et des séances de sport, suivi bien-être (hydratation, poids,
besoins caloriques) et gestion des repas avec liste de courses automatique.

Le cahier des charges complet est dans [`PROJET.md`](./PROJET.md).

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript strict · Tailwind CSS v4 ·
shadcn/ui (Radix) · next-themes · Drizzle ORM + PostgreSQL (Neon) · Zod.
Better Auth, Recharts, date-fns et node-ical arrivent avec les phases suivantes.

## Démarrage

Prérequis : Node.js ≥ 20.9 et une base PostgreSQL (Neon recommandé).

```bash
npm install
cp .env.example .env.local   # puis renseigner DATABASE_URL
npm run db:check             # vérifie la connexion à la base
npm run dev                  # http://localhost:3000
```

### Créer la base sur Neon

1. Créer un projet sur [neon.tech](https://neon.tech) (région Europe, ex. Frankfurt).
2. **Connect** → cocher **Connection pooling** → copier l'URL (hôte en `-pooler`).
3. La coller dans `.env.local` (`DATABASE_URL=...`), puis `npm run db:check`.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Génère les types de routes puis vérifie TypeScript |
| `npm run db:generate` | Crée une migration SQL à partir du schéma Drizzle |
| `npm run db:migrate` | Applique les migrations sur `DATABASE_URL` |
| `npm run db:studio` | Explorateur de base Drizzle Studio |
| `npm run db:check` | Teste la connexion à la base |

## Arborescence

```
src/
  app/                 Routes (App Router)
    (auth)/            /login, /register… (sans navigation)
    app/               Espace connecté /app/* (bottom nav mobile, sidebar desktop)
  components/
    ui/                Composants shadcn/ui adaptés à la DA (44px tactiles, rounded-2xl)
    layout/            Navigation, en-têtes de page, logo
    theme/             Thème clair / sombre / système
  db/                  Client Drizzle + schéma (src/db/schema)
  features/            Code métier par fonctionnalité : planning, bien-etre, repas
  lib/                 Utilitaires partagés (calculs, constantes…)
scripts/               Scripts CLI (vérif. BDD, seed Ciqual…)
drizzle/               Migrations SQL générées
```

## Design system

Les couleurs du brief sont définies en variables CSS dans `src/app/globals.css`
(clair dans `:root`, sombre dans `.dark`) et exposées en classes Tailwind :
`bg-surface`, `bg-surface-2`, `text-link`, `bg-water`, `bg-sport`, `bg-course`,
`text-success`, `text-danger`…

- `--muted` du brief (texte secondaire) → `text-muted-foreground` ;
  `--accent` du brief (liens, focus) → `text-link` / `ring`.
  (shadcn/ui utilise déjà `muted` et `accent` pour des fonds discrets.)
- En clair, `water`, `sport` et `success` sont trop pâles pour du texte sur fond
  blanc : utiliser `text-water-strong`, `text-sport-strong`, `text-success-strong`
  pour le texte et les icônes (contraste AA garanti).

## Roadmap

- [x] **Phase 0** — Setup : Next.js, Tailwind, shadcn/ui, thème, layout mobile, Drizzle
- [ ] **Phase 1** — Auth (Better Auth), onboarding, profil, calculs + tests
- [ ] **Phase 2** — Planning : import .ics, séances de sport, vues jour / semaine
- [ ] **Phase 3** — Bien-être : hydratation, poids, IMC, besoins
- [ ] **Phase 4** — Repas : Ciqual, Open Food Facts, recettes, planification
- [ ] **Phase 5** — Liste de courses
- [ ] **Phase 6** — Finitions : PWA, accessibilité, export, déploiement Vercel
