/**
 * Brand — logo de l'app (pictogramme + nom), utilisé dans l'en-tête mobile,
 * la sidebar desktop et la landing.
 */
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/site";

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Activity className="size-4.5" strokeWidth={2.5} aria-hidden />
      </span>
      <span className="text-lg">{APP_NAME}</span>
    </span>
  );
}
