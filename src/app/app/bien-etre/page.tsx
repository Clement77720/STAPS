/**
 * /app/bien-etre — Hydratation, poids, IMC, besoins caloriques (Phase 3).
 */
import type { Metadata } from "next";
import { HeartPulse } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Bien-être" };

export default function BienEtrePage() {
  return (
    <>
      <PageHeader title="Bien-être" description="Hydratation, poids et besoins du jour." />
      <ComingSoon
        icon={HeartPulse}
        phase={3}
        title="Ton suivi bien-être"
        features={[
          "Jauge d'hydratation du jour avec ajouts rapides (+250 ml, +500 ml)",
          "Objectif d'eau ajusté les jours de sport (+500 ml)",
          "Suivi du poids avec courbe d'évolution",
          "IMC et besoins caloriques calculés (Mifflin-St Jeor)",
        ]}
      />
    </>
  );
}
