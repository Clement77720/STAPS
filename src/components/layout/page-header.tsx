/**
 * PageHeader — titre de page + description + zone d'actions à droite.
 * Utilisé en haut de chaque écran de l'espace connecté.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-6 flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-balance lg:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
