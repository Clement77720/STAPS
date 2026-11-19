"use client";

/**
 * FormField — relie un champ react-hook-form aux composants Field de shadcn/ui :
 * libellé, description, message d'erreur et attributs d'accessibilité
 * (id, aria-invalid, aria-describedby) sont gérés une seule fois ici.
 *
 * Usage :
 *   <FormField control={form.control} name="email" label="Email">
 *     {(field) => <Input type="email" {...field} />}
 *   </FormField>
 *
 * Pour un groupe (boutons radio…), le 2e argument fournit `labelId`, à passer
 * en `aria-labelledby` (un <label for> ne peut pas viser un groupe).
 */
import { useId, type ReactNode } from "react";
import {
  type Control,
  Controller,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

export type FormFieldRenderProps<T extends FieldValues, N extends FieldPath<T>> = ControllerRenderProps<T, N> & {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
};

export function FormField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  className,
  children,
}: {
  // `any` : le formulaire peut transformer ses valeurs (zodResolver), peu importe ici.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<T, any, any>;
  name: N;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  children: (field: FormFieldRenderProps<T, N>, meta: { labelId: string }) => ReactNode;
}) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel id={`${id}-label`} htmlFor={id}>
            {label}
          </FieldLabel>
          {children(
            { ...field, id, "aria-invalid": fieldState.invalid, "aria-describedby": descriptionId },
            { labelId: `${id}-label` },
          )}
          {description ? <FieldDescription id={descriptionId}>{description}</FieldDescription> : null}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
