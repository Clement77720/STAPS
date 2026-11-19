"use client";

/**
 * AppNav — navigation principale de l'espace connecté (/app/*).
 *
 * Un seul composant, deux présentations (brief §3) :
 *  - mobile (< 1024px) : barre fixe en bas avec 4 onglets ;
 *  - desktop (≥ 1024px, préfixe `lg:`) : sidebar fixe à gauche.
 *
 * L'onglet actif est déduit du segment de route sélectionné sous /app
 * (`useSelectedLayoutSegment`). Avec Cache Components, ce hook peut
 * "suspendre" sur les routes à paramètre dynamique (ex. /app/repas/recettes/[id]) :
 * on l'isole donc derrière un <Suspense> dont le fallback affiche les mêmes
 * liens sans état actif, pour que le reste du layout reste pré-rendu.
 */
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { Brand } from "@/components/layout/brand";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { updateThemeAction } from "@/features/profil/actions";

export function AppNav() {
  return (
    <>
      {/* ---------- Sidebar desktop ---------- */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-sidebar px-4 py-6 lg:flex">
        <Link href="/app/planning" className="mb-8 rounded-xl px-2 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
          <Brand />
        </Link>
        <nav aria-label="Navigation principale" className="flex-1">
          <Suspense fallback={<SidebarLinks active={null} />}>
            <SidebarLinksWithSegment />
          </Suspense>
        </nav>
        <div className="space-y-2">
          <p className="px-2 text-xs font-medium text-muted-foreground">Thème</p>
          <ThemeToggle variant="segmented" onThemeChange={updateThemeAction} />
        </div>
      </aside>

      {/* ---------- Barre du bas mobile ---------- */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-backdrop-filter:bg-surface/80 lg:hidden"
      >
        <Suspense fallback={<BottomLinks active={null} />}>
          <BottomLinksWithSegment />
        </Suspense>
      </nav>
    </>
  );
}

function SidebarLinksWithSegment() {
  return <SidebarLinks active={useSelectedLayoutSegment()} />;
}

function BottomLinksWithSegment() {
  return <BottomLinks active={useSelectedLayoutSegment()} />;
}

function SidebarLinks({ active }: { active: string | null }) {
  return (
    <ul className="space-y-1">
      {NAV_ITEMS.map(({ segment, href, label, icon: Icon }) => {
        const isActive = active === segment;
        return (
          <li key={segment}>
            <Link
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors",
                "hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                isActive && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary dark:bg-primary/15",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function BottomLinks({ active }: { active: string | null }) {
  return (
    <ul className="mx-auto grid h-16 max-w-lg grid-cols-4">
      {NAV_ITEMS.map(({ segment, href, label, icon: Icon }) => {
        const isActive = active === segment;
        return (
          <li key={segment}>
            <Link
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex h-full flex-col items-center justify-center gap-1 text-[0.7rem] font-medium text-muted-foreground transition-colors",
                "focus-visible:outline-none",
                isActive && "text-primary",
              )}
            >
              {/* Pastille derrière l'icône : indique l'onglet actif et porte l'anneau de focus clavier */}
              <span
                className={cn(
                  "grid h-8 w-14 place-items-center rounded-full transition-colors",
                  "group-focus-visible:ring-3 group-focus-visible:ring-ring/50",
                  isActive && "bg-primary/12 dark:bg-primary/20",
                )}
              >
                <Icon className="size-5" strokeWidth={isActive ? 2.4 : 2} aria-hidden />
              </span>
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
