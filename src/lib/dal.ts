/**
 * dal.ts — Couche d'accès aux données de session (Data Access Layer).
 *
 * C'est ICI, côté serveur, que l'authentification est réellement vérifiée.
 * `proxy.ts` ne fait qu'un contrôle rapide de présence du cookie.
 * Toute page ou Server Action manipulant des données doit passer par ces fonctions,
 * puis filtrer ses requêtes avec `user.id` (jamais un id envoyé par le client).
 *
 * Avec Cache Components, ces fonctions lisent les en-têtes de la requête :
 * les composants qui les appellent doivent être rendus derrière un <Suspense>.
 */
import "server-only";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { auth } from "@/lib/auth";

/** Session courante, ou null. Mise en cache le temps de la requête (React cache). */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/** Utilisateur connecté ; redirige vers /login sinon. */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}

/** Profil de l'utilisateur (null tant que l'étape 1 de l'onboarding n'est pas faite). */
export const getProfile = cache(async (userId: string) => {
  const [row] = await db.select().from(profile).where(eq(profile.userId, userId)).limit(1);
  return row ?? null;
});

/**
 * Utilisateur connecté ET onboarding terminé ; sinon redirige vers /login ou /onboarding.
 * À utiliser par toutes les pages de /app/*.
 */
export async function requireOnboardedUser() {
  const user = await requireUser();
  const userProfile = await getProfile(user.id);
  if (!userProfile?.onboardingCompletedAt) redirect("/onboarding");
  return { user, profile: userProfile };
}
