/**
 * /reset-password?token=… — Choix du nouveau mot de passe (lien reçu par email).
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFormSkeleton } from "@/features/auth/components/auth-form-skeleton";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Nouveau mot de passe">
      <Suspense fallback={<AuthFormSkeleton fields={2} />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
