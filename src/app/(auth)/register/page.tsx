/**
 * /register — Création de compte, suivie de l'onboarding.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/features/auth/components/auth-card";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = { title: "Inscription" };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Créer un compte"
      description="Quelques secondes, et on configure ton espace."
      footer={
        <>
          Déjà inscrit·e ?&nbsp;
          <Link href="/login" className="font-medium text-link underline-offset-4 hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
