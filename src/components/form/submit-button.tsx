/**
 * SubmitButton — bouton d'envoi pleine largeur avec indicateur de chargement.
 */
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function SubmitButton({
  pending,
  children,
  ...props
}: ComponentProps<typeof Button> & { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending} aria-busy={pending} {...props}>
      {pending ? <Spinner aria-hidden /> : null}
      {children}
    </Button>
  );
}
