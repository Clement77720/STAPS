/**
 * Layout de l'espace connecté (/app/*).
 *
 * Mobile : en-tête compact (logo + thème) en haut, contenu, barre d'onglets en bas.
 * Desktop (≥ lg) : sidebar fixe à gauche (w-64), contenu décalé d'autant.
 *
 * Protection :
 *  1. src/proxy.ts redirige vers /login si le cookie de session est absent ;
 *  2. <SessionGuard> vérifie la session et l'onboarding au chargement de l'app ;
 *  3. chaque page/Server Action revérifie via src/lib/dal.ts (le layout n'est pas
 *     ré-exécuté lors des navigations côté client, il ne suffit donc pas).
 */
import Link from "next/link";
import { Suspense } from "react";
import { AppNav } from "@/components/layout/app-nav";
import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { updateThemeAction } from "@/features/profil/actions";
import { ThemeSync } from "@/features/profil/components/theme-sync";
import { requireOnboardedUser } from "@/lib/dal";

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="min-h-dvh lg:pl-64">
      <header className="sticky top-0 z-30 flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center justify-between border-b bg-background/85 px-4 pt-[env(safe-area-inset-top)] backdrop-blur supports-backdrop-filter:bg-background/70 lg:hidden">
        <Link href="/app/planning" className="rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
          <Brand />
        </Link>
        <ThemeToggle onThemeChange={updateThemeAction} />
      </header>

      <AppNav />

      <Suspense fallback={null}>
        <SessionGuard />
      </Suspense>

      <main className="pb-bottom-nav mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6 lg:pt-10 lg:pb-10">{children}</main>
    </div>
  );
}

/** Redirige si la session est invalide ou l'onboarding incomplet ; synchronise le thème du profil. */
async function SessionGuard() {
  const { profile } = await requireOnboardedUser();
  return <ThemeSync theme={profile.theme} />;
}
