/**
 * Layout de l'espace connecté (/app/*).
 *
 * Mobile : en-tête compact (logo + thème) en haut, contenu, barre d'onglets en bas.
 * Desktop (≥ lg) : sidebar fixe à gauche (w-64), contenu décalé d'autant.
 *
 * Phase 1 : la protection par session (redirection vers /login) sera ajoutée
 * via le fichier `proxy.ts` (ex-middleware) et une vérification côté serveur.
 */
import Link from "next/link";
import { AppNav } from "@/components/layout/app-nav";
import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="min-h-dvh lg:pl-64">
      <header className="sticky top-0 z-30 flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center justify-between border-b bg-background/85 px-4 pt-[env(safe-area-inset-top)] backdrop-blur supports-backdrop-filter:bg-background/70 lg:hidden">
        <Link href="/app/planning" className="rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
          <Brand />
        </Link>
        <ThemeToggle />
      </header>

      <AppNav />

      <main className="pb-bottom-nav mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6 lg:pt-10 lg:pb-10">{children}</main>
    </div>
  );
}
