"use client";

/**
 * Formulaire "mot de passe oublié" : envoie un lien de réinitialisation par email.
 * Le message de confirmation est identique que le compte existe ou non
 * (on ne révèle pas quelles adresses sont inscrites).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormAlert } from "@/components/form/form-alert";
import { FormField } from "@/components/form/form-field";
import { SubmitButton } from "@/components/form/submit-button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { forgotPasswordAction } from "../actions";
import { type ForgotPasswordInput, forgotPasswordSchema } from "../schemas";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const result = await forgotPasswordAction(values);
    if (result.ok) setSentTo(values.email);
    else setError(result.error);
  });

  if (sentTo) {
    return (
      <FormAlert
        variant="success"
        message={`Si un compte existe pour ${sentTo}, tu vas recevoir un email avec un lien valable 1 heure. Pense à vérifier tes spams.`}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormAlert message={error} />
        <FormField control={form.control} name="email" label="Email">
          {(field) => <Input type="email" autoComplete="email" inputMode="email" autoCapitalize="none" {...field} />}
        </FormField>
        <SubmitButton pending={form.formState.isSubmitting} className="w-full">
          Envoyer le lien
        </SubmitButton>
      </FieldGroup>
    </form>
  );
}
