"use client";

/**
 * Formulaire de connexion (email + mot de passe).
 * Validation instantanée côté client (Zod), puis Server Action `loginAction`
 * qui revalide, connecte et redirige.
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
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginAction } from "../actions";
import { type LoginInput, loginSchema } from "../schemas";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    // En cas de succès, l'action redirige : on ne revient ici qu'en cas d'erreur.
    const result = await loginAction(values, searchParams.get("next"));
    if (result && !result.ok) {
      setError(result.error);
      applyServerErrors(form.setError, result.fieldErrors);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        {searchParams.get("reset") === "ok" ? (
          <FormAlert variant="success" message="Mot de passe modifié. Tu peux te connecter." />
        ) : null}
        <FormAlert message={error} />

        <FormField control={form.control} name="email" label="Email">
          {(field) => <Input type="email" autoComplete="email" inputMode="email" autoCapitalize="none" {...field} />}
        </FormField>

        <FormField control={form.control} name="password" label="Mot de passe">
          {(field) => <PasswordInput autoComplete="current-password" {...field} />}
        </FormField>

        <div className="-mt-2 text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-link underline-offset-4 hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>

        <SubmitButton pending={form.formState.isSubmitting} className="w-full">
          Se connecter
        </SubmitButton>
      </FieldGroup>
    </form>
  );
}
