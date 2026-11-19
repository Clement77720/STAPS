/**
 * Mention légale affichée à côté des calculs de santé (IMC, besoins…), cf. brief §7.
 */
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function IndicativeNotice({ className }: { className?: string }) {
  return (
    <p className={cn("flex gap-2 text-xs text-muted-foreground", className)}>
      <Info className="mt-px size-3.5 shrink-0" aria-hidden />
      Valeurs calculées à titre indicatif : elles ne remplacent pas un avis médical.
    </p>
  );
}
