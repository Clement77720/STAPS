/**
 * calculs.ts — Formules de santé et de nutrition utilisées dans l'app.
 *
 * Fonctions pures (aucun accès BDD ni date implicite cachée) : faciles à tester
 * (cf. calculs.test.ts) et utilisables côté serveur comme côté client.
 *
 * ⚠️ Toutes ces valeurs sont indicatives et ne remplacent pas un avis médical :
 * l'UI doit afficher la mention prévue (cf. <IndicativeNotice />).
 */

export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lose" | "maintain" | "gain";

/* -------------------------------------------------------------------------- */
/* Âge                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Âge en années révolues à la date `today`.
 * On compare mois/jour pour ne compter l'année en cours qu'une fois
 * l'anniversaire passé (ex. né le 20/11/2005 → 20 ans le 20/11/2025, pas avant).
 *
 * @param birthDate date ISO "AAAA-MM-JJ" (format stocké en BDD)
 */
export function calculerAge(birthDate: string, today: Date = new Date()): number {
  const [year, month, day] = birthDate.split("-").map(Number);
  let age = today.getFullYear() - year;
  const currentMonth = today.getMonth() + 1; // getMonth() est 0-indexé
  const birthdayNotReachedYet =
    currentMonth < month || (currentMonth === month && today.getDate() < day);
  if (birthdayNotReachedYet) age -= 1;
  return age;
}

/* -------------------------------------------------------------------------- */
/* IMC                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Indice de Masse Corporelle = poids (kg) / taille² (m).
 * Ex. 70 kg, 175 cm → 70 / 1,75² = 22,9.
 * Arrondi à 1 décimale, comme il est d'usage de l'afficher.
 */
export function calculerIMC(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export type IMCCategory =
  | "underweight"
  | "normal"
  | "overweight"
  | "obesity_1"
  | "obesity_2"
  | "obesity_3";

/**
 * Classification OMS de l'IMC chez l'adulte.
 * Libellés volontairement neutres (sans jugement) ; les bornes basses sont incluses :
 * 18,5 → corpulence normale, 25 → surpoids, 30 → obésité classe I, etc.
 *
 * Note : l'IMC ne distingue pas masse grasse et masse musculaire ; chez une
 * personne sportive, il peut surestimer la corpulence.
 */
export const IMC_CATEGORIES: readonly { key: IMCCategory; min: number; label: string }[] = [
  { key: "underweight", min: 0, label: "Insuffisance pondérale" },
  { key: "normal", min: 18.5, label: "Corpulence normale" },
  { key: "overweight", min: 25, label: "Surpoids" },
  { key: "obesity_1", min: 30, label: "Obésité (classe I)" },
  { key: "obesity_2", min: 35, label: "Obésité (classe II)" },
  { key: "obesity_3", min: 40, label: "Obésité (classe III)" },
];

export function categorieIMC(imc: number) {
  // On parcourt de la catégorie la plus haute à la plus basse : la 1re dont le seuil est atteint.
  return [...IMC_CATEGORIES].reverse().find((category) => imc >= category.min) ?? IMC_CATEGORIES[0];
}

/* -------------------------------------------------------------------------- */
/* Métabolisme de base & besoin calorique                                     */
/* -------------------------------------------------------------------------- */

/**
 * Métabolisme de base (kcal/jour) — formule de Mifflin-St Jeor (1990) :
 *  - Homme : 10 × poids + 6,25 × taille − 5 × âge + 5
 *  - Femme : 10 × poids + 6,25 × taille − 5 × âge − 161
 * (poids en kg, taille en cm, âge en années). Résultat arrondi à l'unité.
 */
export function metabolismeDeBase(params: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
}): number {
  const { sex, weightKg, heightCm, age } = params;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

/**
 * Coefficients d'activité (facteurs de Harris-Benedict appliqués au MB).
 * Les descriptions aident l'utilisateur à se situer.
 */
export const ACTIVITY_LEVELS: Record<
  ActivityLevel,
  { coefficient: number; label: string; description: string }
> = {
  sedentary: { coefficient: 1.2, label: "Sédentaire", description: "Peu ou pas d'activité physique" },
  light: { coefficient: 1.375, label: "Légèrement actif", description: "Sport 1 à 3 fois par semaine" },
  moderate: { coefficient: 1.55, label: "Modérément actif", description: "Sport 3 à 5 fois par semaine" },
  active: { coefficient: 1.725, label: "Très actif", description: "Sport 6 à 7 fois par semaine" },
  very_active: {
    coefficient: 1.9,
    label: "Extrêmement actif",
    description: "Entraînement biquotidien ou travail physique",
  },
};

/** Ajustement du besoin selon l'objectif : déficit de 15 %, maintien, surplus de 10 %. */
export const GOALS: Record<Goal, { adjustment: number; label: string; description: string }> = {
  lose: { adjustment: -0.15, label: "Perte de poids", description: "Déficit de 15 %" },
  maintain: { adjustment: 0, label: "Maintien", description: "Apport égal à la dépense" },
  gain: { adjustment: 0.1, label: "Prise de masse", description: "Surplus de 10 %" },
};

/**
 * Besoin calorique journalier (kcal) = MB × coefficient d'activité × (1 + ajustement objectif).
 * Ex. MB 1 700, modérément actif (1,55), perte (−15 %) → 1 700 × 1,55 × 0,85 = 2 240.
 * Arrondi à la dizaine : une précision au kcal près n'aurait pas de sens.
 */
export function besoinCaloriqueJournalier(params: {
  metabolismeDeBase: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}): number {
  const { coefficient } = ACTIVITY_LEVELS[params.activityLevel];
  const { adjustment } = GOALS[params.goal];
  return Math.round((params.metabolismeDeBase * coefficient * (1 + adjustment)) / 10) * 10;
}

/**
 * Besoin calorique retenu : la valeur saisie à la main si elle existe,
 * sinon la valeur calculée.
 */
export function besoinCaloriqueRetenu(calculated: number, override: number | null | undefined) {
  const isOverride = override != null && override > 0;
  return { kcal: isOverride ? override : calculated, calculated, isOverride };
}

/* -------------------------------------------------------------------------- */
/* Hydratation                                                                */
/* -------------------------------------------------------------------------- */

/** Bonus d'hydratation les jours où une séance de sport est prévue au planning. */
export const HYDRATATION_BONUS_SPORT_ML = 500;

/**
 * Objectif d'hydratation (ml) = 35 ml × poids (kg), + 500 ml les jours de sport.
 * Ex. 70 kg → 2 450 ml, ou 2 950 ml avec une séance prévue.
 */
export function objectifHydratation(weightKg: number, hasSportToday: boolean): number {
  return Math.round(35 * weightKg) + (hasSportToday ? HYDRATATION_BONUS_SPORT_ML : 0);
}

/* -------------------------------------------------------------------------- */
/* Synthèse                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Calcule toutes les valeurs dérivées d'un profil complet.
 * Retourne `null` si une donnée nécessaire manque (onboarding incomplet).
 */
export function syntheseProfil(
  profile: {
    birthDate: string | null;
    sex: Sex | null;
    heightCm: number | null;
    weightKg: number | null;
    activityLevel: ActivityLevel | null;
    goal: Goal | null;
    dailyKcalOverride: number | null;
  },
  today: Date = new Date(),
) {
  const { birthDate, sex, heightCm, weightKg, activityLevel, goal } = profile;
  if (!birthDate || !sex || !heightCm || !weightKg || !activityLevel || !goal) return null;

  const age = calculerAge(birthDate, today);
  const imc = calculerIMC(weightKg, heightCm);
  const mb = metabolismeDeBase({ sex, weightKg, heightCm, age });
  const besoin = besoinCaloriqueRetenu(
    besoinCaloriqueJournalier({ metabolismeDeBase: mb, activityLevel, goal }),
    profile.dailyKcalOverride,
  );

  return {
    age,
    imc,
    imcCategorie: categorieIMC(imc),
    metabolismeDeBase: mb,
    besoinCalorique: besoin,
    hydratationMl: objectifHydratation(weightKg, false),
  };
}
