# Projet : App perso étudiant STAPS — Emploi du temps, Bien-être & Repas

> Brief destiné à Claude Code. Lis tout le document avant de commencer, puis avance **phase par phase** (voir Roadmap). À la fin de chaque phase : récapitule ce qui a été fait, ce qui reste, et attends validation avant de passer à la suivante.

---

## 1. Contexte

Application web personnelle pour un étudiant en STAPS. Elle regroupe :
1. Son **emploi du temps** (cours importés + séances de sport)
2. Une **section bien-être** (profil physique, hydratation, suivi du poids)
3. Un **onglet repas** (saisie de repas, calcul des calories/macros, génération automatique d'une liste de courses)

L'app doit avoir un **système de comptes** (inscription / connexion). Elle est pensée d'abord pour un seul utilisateur, mais l'architecture doit rester **multi-utilisateur** (toutes les données rattachées à un `userId`).

Usage principal : **sur téléphone**.

---

## 2. Stack technique

| Rôle | Choix |
|---|---|
| Framework | **Next.js** (App Router) + **TypeScript** strict |
| Styles | **Tailwind CSS** (v4) |
| Composants UI | **shadcn/ui** (adapté à la DA ci-dessous) |
| Auth | **Better Auth** (email + mot de passe ; OAuth Google en option) |
| BDD | **PostgreSQL** sur **Neon** |
| ORM | **Drizzle ORM** + drizzle-kit pour les migrations |
| Validation | **Zod** (formulaires + Server Actions) |
| Formulaires | react-hook-form + Zod |
| Thème | **next-themes** (clair / sombre / système) |
| Graphiques | Recharts |
| Dates | date-fns (locale `fr`) |
| Parsing iCal | `node-ical` |
| Icônes | lucide-react |
| Déploiement | Vercel |

### Conventions de code
- **Toujours mettre des commentaires pertinents** dans le code : rôle de chaque fichier/composant, logique métier non évidente (formules, agrégation de la liste de courses, parsing .ics). Pas de commentaires inutiles du genre `// incrémente i`.
- Server Components par défaut, `"use client"` seulement si nécessaire.
- Mutations via **Server Actions** validées avec Zod.
- Chaque requête BDD filtre **toujours** par `userId` de la session (jamais de confiance dans un id envoyé par le client).
- Structure par feature : `src/features/{planning,bien-etre,repas}/` (composants, actions, queries, schémas Zod).
- Variables d'env dans `.env.example` (documentées).
- Interface **en français**.

---

## 3. Direction artistique

### Principes
- **Mobile first** : conçu pour 375px de large, puis adapté tablette/desktop.
- **Mode clair et mode sombre** (bouton de bascule + respect de la préférence système).
- Couleur principale : **bleu foncé**.
- Style : propre, sportif, lisible. Cartes arrondies (`rounded-2xl`), ombres légères en clair, bordures subtiles en sombre.
- Zones tactiles d'au moins 44px. Contrastes conformes WCAG AA.

### Palette (à définir en variables CSS + tokens Tailwind via `@theme`)

| Token | Clair | Sombre | Usage |
|---|---|---|---|
| `--background` | `#F5F7FB` | `#060D1A` | Fond de page |
| `--surface` | `#FFFFFF` | `#0D1A30` | Cartes, sheets |
| `--surface-2` | `#EAF0F8` | `#14243F` | Inputs, zones secondaires |
| `--border` | `#D8E0EC` | `#1F3354` | Bordures |
| `--foreground` | `#0B1A33` | `#E7EDF7` | Texte principal |
| `--muted` | `#5B6B85` | `#93A3BD` | Texte secondaire |
| `--primary` | `#14306B` | `#5B8DEF` | Bleu foncé principal (plus clair en sombre pour le contraste) |
| `--primary-foreground` | `#FFFFFF` | `#060D1A` | Texte sur primary |
| `--accent` | `#2563EB` | `#7AA7FF` | Liens, focus, éléments actifs |
| `--water` | `#0EA5E9` | `#38BDF8` | Hydratation |
| `--sport` | `#F97316` | `#FB923C` | Séances de sport dans le planning |
| `--course` | `#14306B` | `#5B8DEF` | Cours dans le planning |
| `--success` | `#16A34A` | `#4ADE80` | Validation, objectif atteint |
| `--danger` | `#DC2626` | `#F87171` | Erreurs, suppression |

Typographie : **Inter** ou **Geist** via `next/font`. Chiffres tabulaires (`tabular-nums`) pour les stats.

### Navigation
- **Mobile** : barre de navigation fixe en bas avec 4 onglets : `Planning` · `Bien-être` · `Repas` · `Profil`.
- **Desktop (≥ 1024px)** : la même navigation passe en sidebar à gauche.
- Formulaires d'ajout en **bottom sheet** (drawer) sur mobile, en dialog sur desktop.

---

## 4. Fonctionnalités

### 4.1 Authentification & profil
- Inscription, connexion, déconnexion, mot de passe oublié.
- Routes protégées via middleware (`/app/*`), redirection vers `/login`.
- **Onboarding** après l'inscription (3 étapes) : prénom → données physiques → import de l'emploi du temps (ignorable).
- Page Profil : modifier ses infos, choisir le thème, supprimer son compte (avec toutes ses données, RGPD).

### 4.2 Planning (emploi du temps)
**Import des cours**
- Option A (prioritaire) : **URL iCal (.ics)** collée par l'utilisateur (export ADE / ENT). Stockée en BDD, avec un bouton « Resynchroniser » et une resynchro auto si la dernière date de plus de 12 h.
- Option B : **upload d'un fichier .ics**.
- Parsing avec `node-ical` : titre, début, fin, lieu, description. On upsert sur l'`uid` de l'événement iCal pour éviter les doublons. Les événements importés sont marqués `source = "ics"` et ne sont pas modifiables à la main (seulement masquables).
- Gérer les fuseaux horaires (Europe/Paris) et les événements récurrents (RRULE).

**Séances de sport**
- Création manuelle : type (musculation, course, natation, sport co, autre), date, heure de début/fin, intensité (1-5), notes.
- Possibilité de rendre une séance **récurrente** (ex. tous les mardis).
- Bouton « Séance faite » pour la marquer comme réalisée.

**Affichage**
- Vue **Jour** (par défaut sur mobile, swipe gauche/droite pour changer de jour) et vue **Semaine**.
- Cours en `--course`, sport en `--sport`.
- Widget « Aujourd'hui » : prochains cours et prochaine séance.

### 4.3 Bien-être
**Données personnelles** : date de naissance (âge calculé), sexe, taille (cm), poids (kg), niveau d'activité, objectif (perte / maintien / prise de masse).

**Calculs automatiques** (dans `src/lib/calculs.ts`, chaque formule commentée) :
- **IMC** = poids / taille² (m), avec la catégorie OMS affichée sans jugement.
- **Métabolisme de base**, formule Mifflin-St Jeor :
  - Homme : `10 × poids + 6.25 × taille − 5 × âge + 5`
  - Femme : `10 × poids + 6.25 × taille − 5 × âge − 161`
- **Besoin calorique journalier** = MB × coefficient d'activité (1.2 / 1.375 / 1.55 / 1.725 / 1.9), puis ajusté selon l'objectif (−15 % / 0 / +10 %). L'utilisateur peut remplacer la valeur à la main.
- **Objectif d'hydratation** = 35 ml × poids, **+500 ml** les jours où une séance de sport est prévue au planning.

**Hydratation**
- Jauge circulaire du jour (ml bus / objectif).
- Boutons rapides : +250 ml, +500 ml, quantité personnalisée. Annulation de la dernière entrée.
- Historique sur 7 et 30 jours (graphique en barres).

**Suivi du poids**
- Ajout d'une pesée (date + poids). La dernière pesée met à jour le poids du profil.
- Courbe d'évolution.

### 4.4 Repas
**Base d'aliments**
- Recherche d'aliments dans **Ciqual** (table ANSES, valeurs pour 100 g). Importer le CSV/XML Ciqual dans une table `food` via un script de seed (`scripts/seed-ciqual.ts`).
- Recherche de produits du commerce via l'**API Open Food Facts** (recherche par nom + **scan de code-barres** avec la caméra sur mobile, par ex. `@zxing/browser`). Les produits utilisés sont mis en cache dans `food`.
- Création d'aliments personnalisés.
- Chaque aliment a : kcal, protéines, glucides, lipides pour 100 g ou 100 ml, unité de base (`g`, `ml`, `piece`), poids moyen d'une pièce si l'unité est `piece`, et un **rayon** (fruits & légumes, viandes & poissons, crèmerie, épicerie, surgelés, boissons, autre).

**Recettes / repas types**
- Un repas = un nom + une **liste d'ingrédients (aliment + quantité + unité)** + un nombre de portions.
- Calcul automatique des kcal et macros (total et par portion).
- Les repas sont réutilisables (bibliothèque de repas).

**Journal & planification**
- Planifier des repas par jour et par créneau (petit-déj, déjeuner, dîner, collation), en choisissant le nombre de portions.
- Saisie rapide d'un repas ponctuel (sans l'enregistrer dans la bibliothèque).
- Récap du jour : kcal consommées / besoin journalier, répartition des macros (barres ou donut).

**Liste de courses (fonctionnalité clé)**
- Générée à partir des repas planifiés sur une **période choisie** (par défaut : les 7 prochains jours).
- Algorithme (`src/features/repas/liste-courses.ts`, bien commenté) :
  1. Récupérer tous les repas planifiés de la période.
  2. Pour chaque repas : quantité de chaque ingrédient × (portions planifiées / portions de la recette).
  3. **Normaliser les unités** (kg→g, L→ml, pièces conservées en pièces).
  4. **Agréger** par aliment (somme des quantités).
  5. Grouper par **rayon**, trier par ordre alphabétique.
  6. Arrondir proprement (ex. 1 240 g → « 1,25 kg »).
- La liste est enregistrée (snapshot) : cases à cocher, ajout manuel d'articles hors repas, suppression d'un article, bouton « Vider les articles cochés ».
- Partage / export en texte brut (copier dans le presse-papier).

---

## 5. Modèle de données (Drizzle)

Les tables d'auth sont générées par Better Auth (`user`, `session`, `account`, `verification`). Tables métier (toutes avec `id`, `userId` FK en cascade, `createdAt`, `updatedAt`) :

```
profile            userId (unique), firstName, birthDate, sex, heightCm, weightKg,
                   activityLevel, goal, dailyKcalOverride?, theme

calendar_source    userId, type ('url' | 'file'), url?, lastSyncedAt

event              userId, source ('ics' | 'manual'), icsUid?, kind ('course' | 'sport'),
                   title, location?, description?, startAt, endAt,
                   sportType?, intensity?, done (bool), hidden (bool), recurrenceRule?
                   → index unique (userId, icsUid)

weight_entry       userId, date, weightKg

water_entry        userId, consumedAt, amountMl

food               id, source ('ciqual' | 'off' | 'custom'), externalId?, userId? (si custom),
                   name, brand?, kcal100, protein100, carbs100, fat100,
                   baseUnit ('g' | 'ml' | 'piece'), pieceWeightG?, aisle

recipe             userId, name, servings, notes?

recipe_ingredient  recipeId, foodId, quantity, unit

meal_plan          userId, date, slot ('breakfast' | 'lunch' | 'dinner' | 'snack'),
                   recipeId?, servings, customName?   (repas ponctuel)

meal_plan_item     mealPlanId, foodId, quantity, unit  (ingrédients d'un repas ponctuel)

shopping_list      userId, startDate, endDate, generatedAt
shopping_item      listId, foodId?, label, quantity?, unit?, aisle, checked, manual (bool)
```

---

## 6. Arborescence des routes

```
/                       Landing simple + liens connexion / inscription
/login  /register  /forgot-password
/onboarding
/app                    → redirige vers /app/planning
/app/planning           Vue jour / semaine
/app/planning/import    Gestion de l'import .ics
/app/bien-etre          Hydratation + IMC + besoins + poids
/app/repas              Journal du jour + planification de la semaine
/app/repas/recettes     Bibliothèque de repas (+ /nouveau, /[id])
/app/repas/courses      Liste de courses
/app/profil             Infos, thème, compte
```

---

## 7. Sécurité & RGPD
- Poids, taille et alimentation sont des **données de santé** : accès strictement limité au propriétaire, aucune donnée exposée côté client sans contrôle de session.
- Suppression de compte = suppression en cascade de toutes les données.
- Export de ses données en JSON depuis le profil.
- Pas de tracking tiers.
- Les calculs (IMC, besoins) sont indicatifs : afficher une courte mention « à titre indicatif, ne remplace pas un avis médical ».

---

## 8. Roadmap (à suivre dans l'ordre)

**Phase 0 — Setup**
Init Next.js + TS + Tailwind + shadcn/ui, thème clair/sombre avec la palette, layout mobile avec la bottom nav, connexion à Neon, config de Drizzle, `.env.example`.

**Phase 1 — Auth & profil**
Better Auth, pages login/register, middleware, onboarding, page profil, calculs (`calculs.ts`) + tests unitaires (Vitest).

**Phase 2 — Planning**
Table `event`, import .ics (URL + fichier), séances de sport manuelles, vues jour/semaine, widget « Aujourd'hui ».

**Phase 3 — Bien-être**
Hydratation (jauge, ajouts rapides, objectif +500 ml les jours de sport), suivi du poids + courbe, cartes IMC et besoins.

**Phase 4 — Repas**
Seed Ciqual, recherche Open Food Facts, aliments perso, recettes avec calcul des macros, planification, récap du jour.

**Phase 5 — Liste de courses**
Algorithme d'agrégation + tests unitaires (conversions d'unités, agrégation, arrondis), UI avec cases à cocher, ajout manuel, export texte.

**Phase 6 — Finitions**
PWA (manifest, icône, installable sur l'écran d'accueil), états vides et squelettes de chargement, accessibilité, export des données, déploiement Vercel.

---

## 9. Points à confirmer avec moi en cours de route
- La source exacte de l'emploi du temps (ADE en .ics ? autre format ?) → si ce n'est pas du .ics, prévoir un import CSV.
- Inscription ouverte à tous ou limitée (liste blanche d'emails) ?
- Scan de code-barres : indispensable dès la V1 ou plus tard ?
