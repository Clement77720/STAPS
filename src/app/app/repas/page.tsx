/**
 * /app/repas — Journal du jour et planification des repas (Phases 4 et 5).
 */
import type { Metadata } from "next";
import { UtensilsCrossed } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Repas" };

export default function RepasPage() {
  return (
    <>
      <PageHeader title="Repas" description="Ton journal, tes recettes et ta liste de courses." />
      <ComingSoon
        icon={UtensilsCrossed}
        phase={4}
        title="Tes repas"
        features={[
          "Recherche d'aliments (Ciqual, Open Food Facts) et aliments perso",
          "Recettes avec calcul automatique des kcal et macros",
          "Planification par jour et par créneau, récap du jour",
          "Liste de courses générée automatiquement (phase 5)",
        ]}
      />
    </>
  );
}
