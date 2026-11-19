/**
 * /app/planning — Emploi du temps (Phase 2).
 * Provisoire : aperçu des couleurs "cours" et "sport" de la DA.
 */
import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Planning" };

// Exemples statiques, uniquement pour visualiser la palette avant la Phase 2.
const SAMPLE_EVENTS = [
  { time: "08:00 – 10:00", title: "Physiologie de l'effort", place: "Amphi B", kind: "course" },
  { time: "10:15 – 12:15", title: "Anatomie fonctionnelle", place: "Salle 204", kind: "course" },
  { time: "18:00 – 19:30", title: "Musculation", place: "Salle de sport", kind: "sport" },
] as const;

export default function PlanningPage() {
  return (
    <>
      <PageHeader title="Planning" description="Tes cours et tes séances de sport." />

      <section aria-label="Aperçu" className="mb-6 space-y-3">
        {SAMPLE_EVENTS.map((event) => (
          <article
            key={event.title}
            className={
              event.kind === "course"
                ? "rounded-2xl border-l-4 border-course bg-course/8 p-4 dark:bg-course/12"
                : "rounded-2xl border-l-4 border-sport bg-sport/10 p-4 dark:bg-sport/12"
            }
          >
            <p className="text-xs font-medium text-muted-foreground tabular-nums">{event.time}</p>
            <h2 className="mt-0.5 font-semibold">{event.title}</h2>
            <p className="text-sm text-muted-foreground">{event.place}</p>
          </article>
        ))}
      </section>

      <ComingSoon
        icon={CalendarDays}
        phase={2}
        title="Ton emploi du temps"
        features={[
          "Import des cours depuis une URL iCal (ADE / ENT) ou un fichier .ics",
          "Séances de sport manuelles, récurrentes, à cocher une fois faites",
          "Vues jour (swipe) et semaine, widget « Aujourd'hui »",
        ]}
      />
    </>
  );
}
