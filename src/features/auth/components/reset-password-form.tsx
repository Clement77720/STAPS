"use client";

/**
 * Formulaire de nouveau mot de passe, ouvert depuis le lien reçu par email.
 * Better Auth redirige vers /reset-password?token=… (ou ?error=INVALID_TOKEN
 * si le lien est expiré ou déjà utilisé).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { applyServerErrors } from "@/components/form/apply-server-errors";
import { FormAlert } from "@/components/form/form-alert";
import { FormField } from "@/components/form/form-field";
import { PasswordInput } from "@/components/form/password-input";
import { SubmitButton } from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { resetPasswordAction } from "../actions";
import { type ResetPasswordInput, resetPasswordSchema } from "../schemas";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token ?? "", password: "", confirmPassword: "" },
  });

  if (!token || searchParams.get("error")) {
    return (
      <div className="space-y-4">
        <FormAlert message="Ce lien a expiré ou a déjà été utilisé." />
        <Button asChild className="w-full">
          <Link href="/forgot-password">Demander un nouveau lien</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const result = await resetPasswordAction(values);
    if (result && !result.ok) {
      setError(result.error);
      applyServerErrors(form.setError, result.fieldErrors);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormAlert message={error} />
        <FormField control={form.control} name="password" label="Nouveau mot de passe" description="8 caractères minimum.">
          {(field) => <PasswordInput autoComplete="new-password" {...field} />}
        </FormField>
        <FormField control={form.control} name="confirmPassword" label="Confirme le mot de passe">
          {(field) => <PasswordInput autoComplete="new-password" {...field} />}
        </FormField>
        <SubmitButton pending={form.formState.isSubmitting} className="w-full">
          Enregistrer le mot de passe
        </SubmitButton>
      </FieldGroup>
    </form>
  );
}
