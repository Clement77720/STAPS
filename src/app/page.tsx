/**
 * Landing ( / ) — présentation rapide de l'app + accès connexion / inscription.
 * Page statique (pré-rendue au build) ; seul le message "compte supprimé",
 * qui lit l'URL, est rendu derrière un <Suspense>.
 */
import Link from "next/link";
import { Suspense } from "react";
import { CalendarDays, HeartPulse, UtensilsCrossed } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountDeletedToast } from "@/features/profil/components/account-deleted-toast";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Planning",
    description: "Tes cours importés depuis l'ENT et tes séances de sport, au même endroit.",
    tone: "bg-course/10 text-course dark:bg-course/15",
  },
  {
    icon: HeartPulse,
    title: "Bien-être",
    description: "Hydratation, suivi du poids, IMC et besoins caloriques calculés pour toi.",
    tone: "bg-water/10 text-water-strong dark:bg-water/15",
  },
  {
    icon: UtensilsCrossed,
    title: "Repas",
    description: "Tes recettes, leurs macros et une liste de courses générée automatiquement.",
    tone: "bg-sport/10 text-sport-strong dark:bg-sport/15",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6">
      <header className="flex items-center justify-between py-2">
        <Brand />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col justify-center gap-10 py-10">
        <section className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Ton semestre de STAPS, <span className="text-primary">bien organisé</span>.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Cours, entraînements, hydratation et repas : tout ce qui compte pour tenir le rythme, dans une seule app
            pensée pour ton téléphone.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">Créer un compte</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Se connecter</Link>
            </Button>
          </div>
        </section>

        <section aria-label="Fonctionnalités" className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, tone }) => (
            <Card key={title}>
              <CardHeader>
                <div className={`mb-2 grid size-11 place-items-center rounded-xl ${tone}`}>
                  <Icon className="size-5" aria-hidden />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </main>

      <Suspense fallback={null}>
        <AccountDeletedToast />
      </Suspense>

      <footer className="text-center text-xs text-muted-foreground">
        Les calculs de l&apos;app sont donnés à titre indicatif et ne remplacent pas un avis médical.
      </footer>
    </div>
  );
}
