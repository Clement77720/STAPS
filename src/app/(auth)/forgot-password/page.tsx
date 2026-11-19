/**
 * /forgot-password — Demande d'un lien de réinitialisation par email.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/features/auth/components/auth-card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Mot de passe oublié"
      description="Indique ton email : on t'envoie un lien pour en choisir un nouveau."
      footer={
        <Link href="/login" className="font-medium text-link underline-offset-4 hover:underline">
          Retour à la connexion
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
