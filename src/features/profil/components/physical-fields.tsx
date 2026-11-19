"use client";

/**
 * PhysicalFields — champs des données physiques (date de naissance, sexe, taille,
 * poids, niveau d'activité, objectif). Partagés entre l'étape 2 de l'onboarding
 * et le formulaire de la page Profil.
 */
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { ChoiceCards, SegmentedChoice } from "@/components/form/choice-cards";
import { FormField } from "@/components/form/form-field";
import { NumberInput } from "@/components/form/number-input";
import { Input } from "@/components/ui/input";
import { ACTIVITY_OPTIONS, GOAL_OPTIONS, SEX_OPTIONS } from "../options";
import type { PhysicalInput } from "../schemas";

export function PhysicalFields<T extends FieldValues>({
  control,
}: {
  // Le formulaire parent contient au moins les champs de PhysicalInput, parfois plus
  // (page Profil) : le composant est donc générique sur le type du formulaire.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<T, any, any>;
}) {
  /** Nom de champ de PhysicalInput, typé pour le formulaire parent. */
  const name = (field: keyof PhysicalInput) => field as FieldPath<T>;

  return (
    <>
      <FormField control={control} name={name("birthDate")} label="Date de naissance">
        {({ value, ...field }) => (
          <Input type="date" autoComplete="bday" max={new Date().toISOString().slice(0, 10)} value={value ?? ""} {...field} />
        )}
      </FormField>

      <FormField
        control={control}
        name={name("sex")}
        label="Sexe"
        description="Utilisé uniquement pour le calcul du métabolisme de base."
      >
        {(field, { labelId }) => <SegmentedChoice options={SEX_OPTIONS} labelId={labelId} {...field} />}
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField control={control} name={name("heightCm")} label="Taille (cm)">
          {(field) => <NumberInput placeholder="178" {...field} />}
        </FormField>
        <FormField control={control} name={name("weightKg")} label="Poids (kg)">
          {(field) => <NumberInput decimal placeholder="72,5" {...field} />}
        </FormField>
      </div>

      <FormField control={control} name={name("activityLevel")} label="Niveau d'activité">
        {(field, { labelId }) => <ChoiceCards options={ACTIVITY_OPTIONS} labelId={labelId} {...field} />}
      </FormField>

      <FormField control={control} name={name("goal")} label="Objectif">
        {(field, { labelId }) => (
          <ChoiceCards options={GOAL_OPTIONS} labelId={labelId} className="sm:grid-cols-3" {...field} />
        )}
      </FormField>
    </>
  );
}
