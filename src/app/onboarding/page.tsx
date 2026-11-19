/**
 * /onboarding — Configuration du compte après l'inscription (3 étapes).
 *
 * Le contenu dépend de la session : il est rendu derrière <Suspense>
 * (Cache Components). L'étape de départ est déduite de ce qui est déjà enregistré.
 */
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Brand } from "@/components/layout/brand";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db";
import { calendarSource } from "@/db/schema";
import { OnboardingWizard } from "@/features/profil/components/onboarding-wizard";
import { physicalSchema } from "@/features/profil/schemas";
import { getProfile, requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Bienvenue" };

export default function OnboardingPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <header className="py-2">
        <Brand />
      </header>
      <main className="pt-6">
        <Suspense fallback={<OnboardingSkeleton />}>
          <OnboardingContent />
        </Suspense>
      </main>
    </div>
  );
}

async function OnboardingContent() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (profile?.onboardingCompletedAt) redirect("/app/planning");

  const [source] = await db.select().from(calendarSource).where(eq(calendarSource.userId, user.id)).limit(1);

  // Étape de reprise : 1 sans profil, 2 si les données physiques sont incomplètes, sinon 3.
  const initialStep = !profile ? 1 : physicalSchema.safeParse(profile).success ? 3 : 2;

  return (
    <OnboardingWizard
      initialStep={initialStep}
      defaults={{
        firstName: profile?.firstName,
        physical: {
          birthDate: profile?.birthDate ?? undefined,
          sex: profile?.sex ?? undefined,
          heightCm: profile?.heightCm ?? undefined,
          weightKg: profile?.weightKg ?? undefined,
          activityLevel: profile?.activityLevel ?? undefined,
          goal: profile?.goal ?? undefined,
        },
        calendarUrl: source?.url ?? undefined,
      }}
    />
  );
}

function OnboardingSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-11 w-full rounded-xl" />
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}
