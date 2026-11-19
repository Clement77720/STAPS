/**
 * Schémas Zod du profil et de l'onboarding.
 * Utilisés côté client (react-hook-form) ET re-vérifiés dans les Server Actions.
 * Bornes volontairement larges : on veut éviter les fautes de frappe, pas juger.
 */
import { z } from "zod";
import { calculerAge } from "@/lib/calculs";
import { THEMES } from "./options";

export const firstNameSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { error: "Indique ton prénom." })
    .max(50, { error: "50 caractères maximum." }),
});

export const physicalSchema = z.object({
  birthDate: z
    .iso.date({ error: "Indique ta date de naissance." })
    .refine(
      (value) => {
        const age = calculerAge(value);
        return age >= 14 && age <= 100;
      },
      { error: "Vérifie ta date de naissance (entre 14 et 100 ans)." },
    ),
  sex: z.enum(["male", "female"], { error: "Choisis une option." }),
  heightCm: z
    .number({ error: "Indique ta taille en cm." })
    .int({ error: "En centimètres, sans virgule (ex. 178)." })
    .min(120, { error: "Taille minimale : 120 cm." })
    .max(230, { error: "Taille maximale : 230 cm." }),
  weightKg: z
    .number({ error: "Indique ton poids en kg." })
    .min(30, { error: "Poids minimal : 30 kg." })
    .max(250, { error: "Poids maximal : 250 kg." })
    // Une décimale suffit (ex. 72,4 kg).
    .transform((value) => Math.round(value * 10) / 10),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"], {
    error: "Choisis ton niveau d'activité.",
  }),
  goal: z.enum(["lose", "maintain", "gain"], { error: "Choisis ton objectif." }),
});

/**
 * URL iCal de l'emploi du temps (ADE / ENT). Les liens `webcal://` (souvent
 * proposés par ADE) sont convertis en `https://`, que le serveur sait télécharger.
 */
export const calendarUrlSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, { error: "Colle le lien de ton emploi du temps." })
    .transform((value) => value.replace(/^webcal:\/\//i, "https://"))
    .pipe(z.url({ protocol: /^https?$/, error: "Ce lien n'est pas une adresse web valide." })),
});

/** Formulaire complet de la page Profil. */
export const profileSchema = z.object({
  ...firstNameSchema.shape,
  ...physicalSchema.shape,
  /** Vide = utiliser le besoin calculé. */
  dailyKcalOverride: z
    .number({ error: "Nombre entier de kcal." })
    .int({ error: "Nombre entier de kcal." })
    .min(1000, { error: "Minimum : 1 000 kcal." })
    .max(6000, { error: "Maximum : 6 000 kcal." })
    .optional(),
});

export const themeSchema = z.enum(THEMES);

export const deleteAccountSchema = z.object({
  password: z.string().min(1, { error: "Indique ton mot de passe pour confirmer." }),
});

export type FirstNameInput = z.input<typeof firstNameSchema>;
export type PhysicalInput = z.input<typeof physicalSchema>;
export type CalendarUrlInput = z.input<typeof calendarUrlSchema>;
export type ProfileInput = z.input<typeof profileSchema>;
export type DeleteAccountInput = z.input<typeof deleteAccountSchema>;
