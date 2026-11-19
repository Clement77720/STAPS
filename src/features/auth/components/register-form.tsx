"use client";

/**
 * Formulaire d'inscription. Après création du compte, l'utilisateur est
 * connecté automatiquement et redirigé vers l'onboarding.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { applyServerErrors } from "@/components/form/apply-server-errors";
import { FormAlert } from "@/components/form/form-alert";
import { FormField } from "@/components/form/form-field";
import { PasswordInput } from "@/components/form/password-input";
import { SubmitButton } from "@/components/form/submit-button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { registerAction } from "../actions";
import { type RegisterInput, registerSchema } from "../schemas";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const result = await registerAction(values);
    if (result && !result.ok) {
      setError(result.error);
      applyServerErrors(form.setError, result.fieldErrors);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormAlert message={error} />

        <FormField control={form.control} name="email" label="Email">
          {(field) => <Input type="email" autoComplete="email" inputMode="email" autoCapitalize="none" {...field} />}
        </FormField>

        <FormField control={form.control} name="password" label="Mot de passe" description="8 caractères minimum.">
          {(field) => <PasswordInput autoComplete="new-password" {...field} />}
        </FormField>

        <FormField control={form.control} name="confirmPassword" label="Confirme le mot de passe">
          {(field) => <PasswordInput autoComplete="new-password" {...field} />}
        </FormField>

        <SubmitButton pending={form.formState.isSubmitting} className="w-full">
          Créer mon compte
        </SubmitButton>
      </FieldGroup>
    </form>
  );
}
