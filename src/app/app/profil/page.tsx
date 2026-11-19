/**
 * /app/profil — Infos personnelles, apparence et compte.
 *
 * Le contenu dépend de la session : rendu derrière <Suspense> (Cache Components),
 * avec un squelette pendant le chargement.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { IndicativeNotice } from "@/components/indicative-notice";
import { PageHeader } from "@/components/layout/page-header";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { updateThemeAction } from "@/features/profil/actions";
import { DeleteAccount } from "@/features/profil/components/delete-account";
import { ProfileForm } from "@/features/profil/components/profile-form";
import { syntheseProfil } from "@/lib/calculs";
import { requireOnboardedUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Profil" };

export default function ProfilPage() {
  return (
    <>
      <PageHeader title="Profil" description="Tes informations et tes préférences." />
      <div className="space-y-4">
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileContent />
        </Suspense>

        <Card>
          <CardHeader>
            <CardTitle>Apparence</CardTitle>
            <CardDescription>Clair, sombre, ou selon le réglage de ton téléphone.</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle variant="segmented" onThemeChange={updateThemeAction} />
          </CardContent>
        </Card>

        <Suspense fallback={<Skeleton className="h-48 rounded-2xl" />}>
          <AccountCard />
        </Suspense>
      </div>
    </>
  );
}

async function ProfileContent() {
  const { profile } = await requireOnboardedUser();
  // Besoin calculé SANS la saisie manuelle, pour l'afficher en aide.
  const synthese = syntheseProfil({ ...profile, dailyKcalOverride: null });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes infos</CardTitle>
        <CardDescription>Elles servent aux calculs de la section Bien-être.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProfileForm
          calculatedKcal={synthese?.besoinCalorique.calculated ?? null}
          defaultValues={{
            firstName: profile.firstName,
            birthDate: profile.birthDate ?? "",
            sex: profile.sex ?? undefined,
            heightCm: profile.heightCm ?? undefined,
            weightKg: profile.weightKg ?? undefined,
            activityLevel: profile.activityLevel ?? undefined,
            goal: profile.goal ?? undefined,
            dailyKcalOverride: profile.dailyKcalOverride ?? undefined,
          }}
        />
        <IndicativeNotice />
      </CardContent>
    </Card>
  );
}

async function AccountCard() {
  const { user } = await requireOnboardedUser();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compte</CardTitle>
        <CardDescription className="break-all">Connecté avec {user.email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <SignOutButton />
        <DeleteAccount />
      </CardContent>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <Card aria-hidden>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
