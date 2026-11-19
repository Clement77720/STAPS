"use client";

/**
 * ThemeToggle — sélecteur de thème (Clair / Sombre / Système).
 *
 * Deux variantes :
 *  - `compact` (par défaut) : bouton icône + menu déroulant, pour l'en-tête mobile.
 *  - `segmented` : trois boutons côte à côte, pour la sidebar desktop et la page Profil.
 *    Container query : si le conteneur fait moins de 18rem (sidebar), l'icône passe
 *    au-dessus du libellé pour que tout tienne.
 *
 * next-themes ne connaît le thème réel qu'après l'hydratation côté client :
 * on attend donc d'être "monté" avant d'afficher l'état sélectionné, sinon le
 * rendu serveur et le rendu client divergent (erreur d'hydratation).
 */
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Système", icon: Monitor },
] as const;

/** Vaut `false` pendant le rendu serveur et l'hydratation, `true` ensuite. */
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle({
  variant = "compact",
  className,
}: {
  variant?: "compact" | "segmented";
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();
  const current = mounted ? (theme ?? "system") : undefined;

  if (variant === "segmented") {
    return (
      <div
        role="radiogroup"
        aria-label="Thème de l'application"
        className={cn("@container grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1", className)}
      >
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const selected = current === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTheme(value)}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors @min-[18rem]:flex-row @min-[18rem]:gap-1.5 @min-[18rem]:text-sm",
                "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                selected && "bg-surface text-foreground shadow-card dark:ring-1 dark:ring-border",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className} aria-label="Changer de thème">
          {/* Les deux icônes sont rendues ; le CSS affiche la bonne selon la classe .dark (pas de flash) */}
          <Sun className="size-5 dark:hidden" aria-hidden />
          <Moon className="hidden size-5 dark:block" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuRadioGroup value={current} onValueChange={setTheme}>
          {OPTIONS.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value} className="min-h-11">
              <Icon className="size-4" aria-hidden />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
