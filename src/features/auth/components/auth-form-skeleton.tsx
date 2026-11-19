/**
 * Squelette affiché pendant le chargement d'un formulaire d'authentification.
 */
import { Skeleton } from "@/components/ui/skeleton";

export function AuthFormSkeleton({ fields }: { fields: number }) {
  return (
    <div className="flex flex-col gap-5" aria-hidden>
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ))}
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}
