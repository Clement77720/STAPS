/**
 * Reporte les erreurs de validation renvoyées par une Server Action
 * (champ par champ) dans le formulaire react-hook-form.
 */
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export function applyServerErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fieldErrors: Record<string, string[] | undefined> | undefined,
) {
  for (const [name, messages] of Object.entries(fieldErrors ?? {})) {
    if (messages?.[0]) setError(name as Path<T>, { type: "server", message: messages[0] });
  }
}
