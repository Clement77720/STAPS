/**
 * /login — Connexion.
 * Le formulaire lit `?next=` et `?reset=ok` dans l'URL (useSearchParams) :
 * il est donc rendu derrière un <Suspense> (exigence de Cache Components).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";
import { AuthFormSkeleton } from "@/features/auth/components/auth-form-skeleton";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Connexion"
      description="Content de te revoir !"
      footer={
        <>
          Pas encore de compte ?&nbsp;
          <Link href="/register" className="font-medium text-link underline-offset-4 hover:underline">
            Créer un compte
          </Link>
        </>
      }
    >
      <Suspense fallback={<AuthFormSkeleton fields={2} />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
