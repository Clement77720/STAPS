/**
 * FormAlert — message d'erreur global d'un formulaire (ex. "mot de passe incorrect"),
 * ou message de succès avec `variant="success"`.
 */
import { CircleAlert, CircleCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function FormAlert({ message, variant = "error" }: { message: string | null | undefined; variant?: "error" | "success" }) {
  if (!message) return null;
  if (variant === "success") {
    return (
      <Alert className="border-success/40 bg-success/10">
        <CircleCheck className="text-success-strong" aria-hidden />
        <AlertDescription className="text-foreground">{message}</AlertDescription>
      </Alert>
    );
  }
  return (
    <Alert variant="destructive" className="border-destructive/40 bg-destructive/5">
      <CircleAlert aria-hidden />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
