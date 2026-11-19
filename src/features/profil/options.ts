/**
 * Options des champs du profil (valeurs stockées en BDD → libellés affichés).
 * Les coefficients associés sont dans src/lib/calculs.ts.
 */
import { ACTIVITY_LEVELS, type ActivityLevel, GOALS, type Goal, type Sex } from "@/lib/calculs";

export const SEX_OPTIONS: readonly { value: Sex; label: string }[] = [
  { value: "female", label: "Femme" },
  { value: "male", label: "Homme" },
];

export const ACTIVITY_OPTIONS = (Object.keys(ACTIVITY_LEVELS) as ActivityLevel[]).map((value) => ({
  value,
  label: ACTIVITY_LEVELS[value].label,
  description: ACTIVITY_LEVELS[value].description,
}));

export const GOAL_OPTIONS = (Object.keys(GOALS) as Goal[]).map((value) => ({
  value,
  label: GOALS[value].label,
  description: GOALS[value].description,
}));

export const THEMES = ["light", "dark", "system"] as const;
export type ThemePreference = (typeof THEMES)[number];
