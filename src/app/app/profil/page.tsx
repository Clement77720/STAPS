/**
 * /app/profil — Infos personnelles, thème, compte (Phase 1).
 * Provisoire : seul le choix du thème est fonctionnel.
 */
import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";
import { PageHeader } from "@/components/layout/page-header";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Profil" };

export default function ProfilPage() {
  return (
    <>
      <PageHeader title="Profil" description="Tes informations et tes préférences." />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Apparence</CardTitle>
            <CardDescription>Clair, sombre, ou selon le réglage de ton téléphone.</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle variant="segmented" />
          </CardContent>
        </Card>

        <ComingSoon
          icon={UserRound}
          phase={1}
          title="Ton compte"
          features={[
            "Modifier ton prénom et tes données physiques",
            "Exporter toutes tes données (JSON)",
            "Supprimer ton compte et toutes tes données",
          ]}
        />
      </div>
    </>
  );
}
