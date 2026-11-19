"use server";

/**
 * Server Actions d'authentification : connexion, inscription, mot de passe oublié,
 * réinitialisation, déconnexion.
 *
 * Chaque action revalide les données avec Zod (on ne fait jamais confiance au
 * client), limite le nombre de tentatives (anti brute-force, cf. rate-limit.ts),
 * appelle Better Auth côté serveur (`auth.api.*`) — le plugin nextCookies
 * pose/supprime alors le cookie de session — puis redirige.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { type ActionResult, fail, invalid, ok } from "@/lib/action-result";
import { auth, isSignUpAllowed } from "@/lib/auth";
import { getProfile } from "@/lib/dal";
import { checkRateLimits, clientIp, RATE_LIMITS, resetRateLimits } from "@/lib/rate-limit";
import { authErrorMessage } from "./errors";
import { safeNextPath } from "./safe-redirect";
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
  type LoginInput,
  loginSchema,
  type RegisterInput,
  registerSchema,
  type ResetPasswordInput,
  resetPasswordSchema,
} from "./schemas";

export async function loginAction(input: LoginInput, next?: string | null): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const limited = await checkRateLimits([
    { key: `login:email:${parsed.data.email}`, rule: RATE_LIMITS.loginPerEmail },
    { key: `login:ip:${await clientIp()}`, rule: RATE_LIMITS.loginPerIp },
  ]);
  if (limited) return fail(limited);

  let userId: string;
  try {
    const result = await auth.api.signInEmail({
      body: { email: parsed.data.email, password: parsed.data.password, rememberMe: true },
      headers: await headers(),
    });
    userId = result.user.id;
  } catch (error) {
    return fail(authErrorMessage(error));
  }
  // Connexion réussie : on repart de zéro pour cet email.
  await resetRateLimits([`login:email:${parsed.data.email}`]);

  // redirect() lève une exception gérée par Next : il doit rester hors du try/catch.
  const profile = await getProfile(userId);
  if (!profile?.onboardingCompletedAt) redirect("/onboarding");
  redirect(safeNextPath(next) ?? "/app/planning");
}

export async function registerAction(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const limited = await checkRateLimits([{ key: `register:ip:${await clientIp()}`, rule: RATE_LIMITS.registerPerIp }]);
  if (limited) return fail(limited);

  // Vérification anticipée pour un message clair (le hook Better Auth bloque aussi).
  if (!isSignUpAllowed(parsed.data.email)) {
    return fail("Les inscriptions sont fermées pour cette adresse email.");
  }

  try {
    await auth.api.signUpEmail({
      // Le prénom est demandé à l'étape 1 de l'onboarding (et recopié dans `name`).
      body: { name: "", email: parsed.data.email, password: parsed.data.password },
      headers: await headers(),
    });
  } catch (error) {
    return fail(authErrorMessage(error));
  }

  redirect("/onboarding");
}

export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const limited = await checkRateLimits([
    { key: `forgot:email:${parsed.data.email}`, rule: RATE_LIMITS.forgotPerEmail },
    { key: `forgot:ip:${await clientIp()}`, rule: RATE_LIMITS.forgotPerIp },
  ]);
  if (limited) return fail(limited);

  try {
    // Better Auth répond de la même façon que le compte existe ou non :
    // on n'indique donc jamais si l'email est inscrit.
    await auth.api.requestPasswordReset({
      body: { email: parsed.data.email, redirectTo: "/reset-password" },
      headers: await headers(),
    });
  } catch (error) {
    return fail(authErrorMessage(error));
  }
  return ok();
}

export async function resetPasswordAction(input: ResetPasswordInput): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const limited = await checkRateLimits([{ key: `reset:ip:${await clientIp()}`, rule: RATE_LIMITS.resetPerIp }]);
  if (limited) return fail(limited);

  try {
    await auth.api.resetPassword({
      body: { token: parsed.data.token, newPassword: parsed.data.password },
      headers: await headers(),
    });
  } catch (error) {
    return fail(authErrorMessage(error));
  }

  redirect("/login?reset=ok");
}

export async function signOutAction(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
