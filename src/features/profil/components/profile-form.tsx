"use client";

/**
 * ProfileForm — modification du prénom, des données physiques et du besoin
 * calorique manuel (page Profil). Le besoin calculé est affiché en aide.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { type DefaultValues, useForm } from "react-hook-form";
import { toast } from "sonner";
import { applyServerErrors } from "@/components/form/apply-server-errors";
import { FormAlert } from "@/components/form/form-alert";
import { FormField } from "@/components/form/form-field";
import { NumberInput } from "@/components/form/number-input";
import { SubmitButton } from "@/components/form/submit-button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/format";
import { updateProfileAction } from "../actions";
import { type ProfileInput, profileSchema } from "../schemas";
import { PhysicalFields } from "./physical-fields";

export function ProfileForm({
  defaultValues,
  calculatedKcal,
}: {
  defaultValues: DefaultValues<ProfileInput>;
  /** Besoin calorique calculé à partir des données actuelles (avant saisie manuelle). */
  calculatedKcal: number | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const result = await updateProfileAction(values);
    if (result.ok) {
      toast.success("Profil enregistré");
      // Les valeurs enregistrées deviennent la nouvelle référence (bouton désactivé tant que rien ne change).
      form.reset(values);
    } else {
      setError(result.error);
      applyServerErrors(form.setError, result.fieldErrors);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormAlert message={error} />

        <FormField control={form.control} name="firstName" label="Prénom">
          {(field) => <Input autoComplete="given-name" autoCapitalize="words" {...field} />}
        </FormField>

        <PhysicalFields control={form.control} />

        <FormField
          control={form.control}
          name="dailyKcalOverride"
          label="Besoin calorique personnalisé (kcal/jour)"
          description={
            calculatedKcal
              ? `Calculé pour toi : ${formatNumber(calculatedKcal)} kcal. Laisse vide pour utiliser ce calcul.`
              : "Laisse vide pour utiliser le calcul automatique."
          }
        >
          {(field) => (
            <NumberInput placeholder={calculatedKcal ? formatNumber(calculatedKcal) : "2 400"} {...field} />
          )}
        </FormField>

        <SubmitButton pending={form.formState.isSubmitting} disabled={!form.formState.isDirty} className="w-full">
          Enregistrer
        </SubmitButton>
      </FieldGroup>
    </form>
  );
}
