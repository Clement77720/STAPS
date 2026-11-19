/**
 * auth.ts — Configuration serveur de Better Auth.
 *
 * - Email + mot de passe uniquement (pas de fournisseur OAuth).
 * - Sessions stockées en BDD (tables de src/db/schema/auth.ts), cookie httpOnly.
 * - Inscriptions éventuellement limitées par une liste blanche (ALLOWED_EMAILS).
 * - Suppression de compte activée : supprimer `user` supprime en cascade toutes
 *   les données liées (FK `onDelete: "cascade"` sur chaque table métier).
 *
 * Utilisé par la route /api/auth/[...all] et par les Server Actions (via auth.api).
 */
import "server-only";
import { waitUntil } from "@vercel/functions";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as authSchema from "@/db/schema/auth";
import { resetPasswordEmail, sendEmail } from "@/lib/email";
import { APP_NAME } from "@/lib/site";

/**
 * Liste blanche d'emails autorisés à s'inscrire (séparés par des virgules).
 * Variable vide ou absente → inscriptions ouvertes à tous.
 */
export function isSignUpAllowed(email: string): boolean {
  const allowed = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return allowed.length === 0 || allowed.includes(email.trim().toLowerCase());
}

export const auth = betterAuth({
  appName: APP_NAME,
  // BETTER_AUTH_SECRET et BETTER_AUTH_URL sont lus automatiquement depuis l'environnement.
  database: drizzleAdapter(db, { provider: "pg", schema: authSchema, transaction: true }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Connecté directement après l'inscription (pas de vérification d'email).
    autoSignIn: true,
    // Après une réinitialisation, toutes les sessions ouvertes sont déconnectées.
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      // Envoi en tâche de fond : la réponse ne doit pas être plus lente quand le
      // compte existe (sinon on pourrait deviner les emails inscrits).
      // waitUntil garde la fonction serverless en vie jusqu'à la fin de l'envoi.
      waitUntil(sendEmail(resetPasswordEmail({ to: user.email, url })));
    },
  },

  user: {
    deleteUser: { enabled: true },
  },

  session: {
    // App surtout utilisée sur téléphone : on reste connecté 30 jours,
    // prolongés automatiquement à chaque visite (au plus une fois par jour).
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    // Pas de cache de session dans un cookie : la session est vérifiée en BDD à
    // chaque requête, pour qu'une déconnexion, une réinitialisation de mot de passe
    // ou une suppression de compte prenne effet immédiatement sur tous les appareils.
    cookieCache: { enabled: false },
  },

  databaseHooks: {
    user: {
      create: {
        // Protège aussi l'endpoint HTTP /api/auth/sign-up/email, pas seulement le formulaire.
        before: async (user) => {
          if (!isSignUpAllowed(user.email)) {
            throw new APIError("FORBIDDEN", {
              code: "SIGN_UP_NOT_ALLOWED",
              message: "Les inscriptions sont fermées pour cette adresse email.",
            });
          }
        },
      },
    },
  },

  /*
   * Routes HTTP désactivées : ces opérations passent UNIQUEMENT par nos Server
   * Actions, qui revalident avec Zod et appliquent nos limites de tentatives
   * (src/lib/rate-limit.ts). Les laisser ouvertes permettrait de contourner ces
   * protections. Le lien de l'email (/reset-password/:token, GET) reste actif :
   * la comparaison des chemins est exacte.
   */
  disabledPaths: [
    "/sign-in/email",
    "/sign-up/email",
    "/request-password-reset",
    "/reset-password",
    "/delete-user",
    "/change-password",
    "/verify-password",
    "/update-user",
    "/change-email",
  ],

  // Pas de tracking tiers (cf. brief §7).
  telemetry: { enabled: false },

  // nextCookies doit rester le DERNIER plugin : il permet aux Server Actions
  // de poser les cookies de session.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
