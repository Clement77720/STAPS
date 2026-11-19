/**
 * ComingSoon — carte "bientôt disponible" pour les écrans pas encore développés.
 * Indique la phase de la roadmap (PROJET.md §8) qui les livrera.
 */
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ComingSoon({
  icon: Icon,
  phase,
  title,
  features,
}: {
  icon: LucideIcon;
  phase: number;
  title: string;
  features: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary dark:bg-primary/15">
          <Icon className="size-5" aria-hidden />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Arrive en phase {phase} de la roadmap.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-link" aria-hidden />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
