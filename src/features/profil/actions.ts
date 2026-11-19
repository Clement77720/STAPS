"use server";

/**
 * Server Actions du profil et de l'onboarding.
 *
 * Règles communes :
 *  - l'utilisateur est TOUJOURS déduit de la session (requireUser), jamais du client ;
 *  - les données reçues sont revalidées avec les schémas Zod partagés ;
 *  - chaque requête filtre sur `userId`.
 */
import { and, eq, isNull } from "drizzle-orm";
import { refresh } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { calendarSource, profile, user as userTable } from "@/db/schema";
import { type ActionResult, fail, invalid, ok } from "@/lib/action-result";
import { auth } from "@/lib/auth";
import { requireOnboardedUser, requireUser } from "@/lib/dal";
import { checkRateLimits, RATE_LIMITS, resetRateLimits } from "@/lib/rate-limit";
import { authErrorMessage } from "@/features/auth/errors";
import {
  type CalendarUrlInput,
  calendarUrlSchema,
  type DeleteAccountInput,
  deleteAccountSchema,
  type FirstNameInput,
  firstNameSchema,
  type PhysicalInput,
  physicalSchema,
  type ProfileInput,
  profileSchema,
  themeSchema,
} from "./schemas";
import type { ThemePreference } from "./options";

/* -------------------------------------------------------------------------- */
/* Onboarding                                                                 */
/* -------------------------------------------------------------------------- */

/** Étape 1 : crée le profil avec le prénom (ou met à jour le prénom si on revient en arrière). */
export async function saveFirstNameAction(input: FirstNameInput): Promise<ActionResult> {
  const currentUser = await requireUser();
  const parsed = firstNameSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  await db
    .insert(profile)
    .values({ userId: currentUser.id, firstName: parsed.data.firstName })
    .onConflictDoUpdate({ target: profile.userId, set: { firstName: parsed.data.firstName } });
  // Le prénom sert aussi de `name` au compte Better Auth.
  await db.update(userTable).set({ name: parsed.data.firstName }).where(eq(userTable.id, currentUser.id));
  return ok();
}

/** Étape 2 : données physiques. */
export async function savePhysicalAction(input: PhysicalInput): Promise<ActionResult> {
  const currentUser = await requireUser();
  const parsed = physicalSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const updated = await db
    .update(profile)
    .set(parsed.data)
    .where(eq(profile.userId, currentUser.id))
    .returning({ id: profile.id });
  if (updated.length === 0) return fail("Commence par indiquer ton prénom (étape 1).");
  return ok();
}

/**
 * Étape 3 : enregistre l'URL iCal (synchronisée en Phase 2), puis termine l'onboarding.
 * Une seule source "url" par utilisateur : on remplace l'éventuelle précédente.
 */
export async function saveCalendarUrlAction(input: CalendarUrlInput): Promise<ActionResult> {
  const currentUser = await requireUser();
  const parsed = calendarUrlSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  await db.transaction(async (tx) => {
    await tx
      .delete(calendarSource)
      .where(and(eq(calendarSource.userId, currentUser.id), eq(calendarSource.type, "url")));
    await tx.insert(calendarSource).values({ userId: currentUser.id, type: "url", url: parsed.data.url });
  });

  return completeOnboardingAction();
}

/** Fin de l'onboarding (aussi appelée par "Passer cette étape"). */
export async function completeOnboardingAction(): Promise<ActionResult> {
  const currentUser = await requireUser();
  const [current] = await db.select().from(profile).where(eq(profile.userId, currentUser.id)).limit(1);

  // Sécurité : on ne termine que si les étapes obligatoires (1 et 2) sont remplies.
  const physical = physicalSchema.safeParse(current ?? {});
  if (!current || !physical.success) return fail("Il manque des informations aux étapes précédentes.");

  await db
    .update(profile)
    .set({ onboardingCompletedAt: new Date() })
    .where(and(eq(profile.userId, currentUser.id), isNull(profile.onboardingCompletedAt)));

  redirect("/app/planning");
}

/* -------------------------------------------------------------------------- */
/* Page Profil                                                                */
/* -------------------------------------------------------------------------- */

export async function updateProfileAction(input: ProfileInput): Promise<ActionResult> {
  const { user: currentUser } = await requireOnboardedUser();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const { dailyKcalOverride, ...values } = parsed.data;
  await db
    .update(profile)
    .set({ ...values, dailyKcalOverride: dailyKcalOverride ?? null })
    .where(eq(profile.userId, currentUser.id));
  await db.update(userTable).set({ name: values.firstName }).where(eq(userTable.id, currentUser.id));

  // Rafraîchit la page côté client pour afficher les valeurs recalculées.
  refresh();
  return ok();
}

/** Mémorise le thème choisi dans le profil (appliqué sur les autres appareils). */
export async function updateThemeAction(theme: ThemePreference): Promise<void> {
  const currentUser = await requireUser();
  const parsed = themeSchema.safeParse(theme);
  if (!parsed.success) return;
  await db.update(profile).set({ theme: parsed.data }).where(eq(profile.userId, currentUser.id));
}

/**
 * Suppression définitive du compte (RGPD), après confirmation du mot de passe.
 * Better Auth supprime `user` ; toutes les tables liées (profil, planning, repas…)
 * sont supprimées en cascade par les clés étrangères.
 */
export async function deleteAccountAction(input: DeleteAccountInput): Promise<ActionResult> {
  const currentUser = await requireUser();
  const parsed = deleteAccountSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  // Le mot de passe est vérifié ici : on limite les essais comme pour la connexion.
  const limited = await checkRateLimits([
    { key: `delete:user:${currentUser.id}`, rule: RATE_LIMITS.deleteAccountPerUser },
  ]);
  if (limited) return fail(limited);

  try {
    await auth.api.deleteUser({ body: { password: parsed.data.password }, headers: await headers() });
  } catch (error) {
    return fail(authErrorMessage(error));
  }
  // Les compteurs anti brute-force contiennent l'email : on les efface aussi (RGPD).
  const email = currentUser.email.toLowerCase();
  await resetRateLimits([`login:email:${email}`, `forgot:email:${email}`, `delete:user:${currentUser.id}`]);

  redirect("/?compte=supprime");
}
