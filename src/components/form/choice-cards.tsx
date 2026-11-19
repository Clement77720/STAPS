"use client";

/**
 * Sélecteurs à choix unique (boutons radio accessibles, basés sur Radix) :
 *  - <ChoiceCards> : une carte par option avec titre + description
 *    (niveau d'activité, objectif) ;
 *  - <SegmentedChoice> : options courtes côte à côte (sexe).
 * Navigation au clavier avec les flèches, zones tactiles ≥ 44px.
 */
import type { Ref } from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

type Option<V extends string> = { value: V; label: string; description?: string };

type ChoiceProps<V extends string> = {
  options: readonly Option<V>[];
  value: V | undefined;
  onChange: (value: V) => void;
  name?: string;
  /** Ref fournie par react-hook-form (focus du groupe en cas d'erreur). */
  ref?: Ref<HTMLDivElement>;
  labelId?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  className?: string;
};

export function ChoiceCards<V extends string>({ options, value, onChange, labelId, className, ref, ...props }: ChoiceProps<V>) {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      value={value ?? ""}
      onValueChange={(next) => onChange(next as V)}
      aria-labelledby={labelId}
      aria-invalid={props["aria-invalid"]}
      aria-describedby={props["aria-describedby"]}
      name={props.name}
      className={cn("grid gap-2", className)}
    >
      {options.map((option) => (
        <RadioGroupPrimitive.Item
          key={option.value}
          value={option.value}
          className={cn(
            "group flex min-h-11 w-full items-center gap-3 rounded-xl border bg-surface px-4 py-3 text-left transition-colors",
            "hover:bg-surface-2 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            "data-[state=checked]:border-primary data-[state=checked]:bg-primary/8 dark:data-[state=checked]:bg-primary/15",
            "aria-invalid:border-destructive",
          )}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-foreground">{option.label}</span>
            {option.description ? (
              <span className="block text-sm text-muted-foreground">{option.description}</span>
            ) : null}
          </span>
          {/* Pastille radio dessinée à la main : pleine quand l'option est cochée */}
          <span
            aria-hidden
            className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-border group-data-[state=checked]:border-primary"
          >
            <span className="size-2.5 scale-0 rounded-full bg-primary transition-transform group-data-[state=checked]:scale-100" />
          </span>
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}

export function SegmentedChoice<V extends string>({ options, value, onChange, labelId, className, ref, ...props }: ChoiceProps<V>) {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      value={value ?? ""}
      onValueChange={(next) => onChange(next as V)}
      orientation="horizontal"
      aria-labelledby={labelId}
      aria-invalid={props["aria-invalid"]}
      aria-describedby={props["aria-describedby"]}
      name={props.name}
      className={cn("grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-surface-2 p-1", className)}
    >
      {options.map((option) => (
        <RadioGroupPrimitive.Item
          key={option.value}
          value={option.value}
          className={cn(
            "min-h-11 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors",
            "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            "data-[state=checked]:bg-surface data-[state=checked]:text-foreground data-[state=checked]:shadow-card dark:data-[state=checked]:ring-1 dark:data-[state=checked]:ring-border",
          )}
        >
          {option.label}
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
