"use client";

/**
 * DeleteAccount — suppression définitive du compte et de toutes ses données (RGPD).
 * Confirmation par mot de passe dans un bottom sheet (mobile) / dialog (desktop).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormAlert } from "@/components/form/form-alert";
import { FormField } from "@/components/form/form-field";
import { PasswordInput } from "@/components/form/password-input";
import { SubmitButton } from "@/components/form/submit-button";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { deleteAccountAction } from "../actions";
import { type DeleteAccountInput, deleteAccountSchema } from "../schemas";

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<DeleteAccountInput>({ resolver: zodResolver(deleteAccountSchema), defaultValues: { password: "" } });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    // En cas de succès, l'action redirige vers l'accueil.
    const result = await deleteAccountAction(values);
    if (result && !result.ok) setError(result.error);
  });

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          form.reset();
          setError(null);
        }
      }}
      trigger={
        <Button variant="destructive" className="w-full">
          <Trash2 aria-hidden />
          Supprimer mon compte
        </Button>
      }
      title="Supprimer ton compte ?"
      description="Ton profil, ton planning, tes repas et tout ton historique seront définitivement effacés. Cette action est irréversible."
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <FormAlert message={error} />
          <FormField control={form.control} name="password" label="Mot de passe">
            {(field) => <PasswordInput autoComplete="current-password" {...field} />}
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <SubmitButton pending={form.formState.isSubmitting} variant="destructive">
              Supprimer définitivement
            </SubmitButton>
          </div>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}
