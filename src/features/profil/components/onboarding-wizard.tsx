"use client";

/**
 * OnboardingWizard — parcours en 3 étapes après l'inscription (brief §4.1) :
 *   1. prénom → 2. données physiques → 3. import de l'emploi du temps (facultatif).
 *
 * Chaque étape est enregistrée en BDD dès sa validation : si l'utilisateur ferme
 * l'app, il reprend là où il s'était arrêté (l'étape initiale est calculée côté serveur).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { applyServerErrors } from "@/components/form/apply-server-errors";
import { FormAlert } from "@/components/form/form-alert";
import { FormField } from "@/components/form/form-field";
import { SubmitButton } from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/action-result";
import {
  completeOnboardingAction,
  saveCalendarUrlAction,
  saveFirstNameAction,
  savePhysicalAction,
} from "../actions";
import {
  type CalendarUrlInput,
  calendarUrlSchema,
  type FirstNameInput,
  firstNameSchema,
  type PhysicalInput,
  physicalSchema,
} from "../schemas";
import { PhysicalFields } from "./physical-fields";

type Step = 1 | 2 | 3;

const STEPS: Record<Step, { title: string; description: string }> = {
  1: { title: "Comment tu t'appelles ?", description: "Ton prénom, pour personnaliser l'app." },
  2: {
    title: "Tes données physiques",
    description: "Elles servent à calculer ton IMC, tes besoins caloriques et ton objectif d'hydratation.",
  },
  3: {
    title: "Ton emploi du temps",
    description: "Colle le lien iCal (.ics) de ton emploi du temps pour retrouver tes cours dans le planning.",
  },
};

export function OnboardingWizard({
  initialStep,
  defaults,
}: {
  initialStep: Step;
  defaults: { firstName?: FirstNameInput["firstName"]; physical: Partial<PhysicalInput>; calendarUrl?: string };
}) {
  const [step, setStep] = useState<Step>(initialStep);
  const { title, description } = STEPS[step];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground tabular-nums">Étape {step} sur 3</p>
        {/* Barre de progression en 3 segments */}
        <div className="mt-2 grid grid-cols-3 gap-1.5" aria-hidden>
          {[1, 2, 3].map((index) => (
            <span key={index} className={cn("h-1.5 rounded-full", index <= step ? "bg-primary" : "bg-surface-2")} />
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {step === 1 ? <FirstNameStep defaultValue={defaults.firstName} onDone={() => setStep(2)} /> : null}
      {step === 2 ? (
        <PhysicalStep defaultValues={defaults.physical} onBack={() => setStep(1)} onDone={() => setStep(3)} />
      ) : null}
      {step === 3 ? <CalendarStep defaultValue={defaults.calendarUrl} onBack={() => setStep(2)} /> : null}
    </div>
  );
}

/** Gère l'appel d'une Server Action et l'affichage de son erreur éventuelle. */
function useStepError() {
  const [error, setError] = useState<string | null>(null);
  return {
    error,
    reset: () => setError(null),
    /** Renvoie true si l'action a réussi. */
    handle: (result: ActionResult | undefined) => {
      if (result && !result.ok) {
        setError(result.error);
        return false;
      }
      return true;
    },
  };
}

function FirstNameStep({ defaultValue, onDone }: { defaultValue?: string; onDone: () => void }) {
  const { error, reset, handle } = useStepError();
  const form = useForm<FirstNameInput>({
    resolver: zodResolver(firstNameSchema),
    defaultValues: { firstName: defaultValue ?? "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    reset();
    const result = await saveFirstNameAction(values);
    if (handle(result)) onDone();
    else if (!result.ok) applyServerErrors(form.setError, result.fieldErrors);
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormAlert message={error} />
        <FormField control={form.control} name="firstName" label="Prénom">
          {(field) => <Input autoComplete="given-name" autoCapitalize="words" autoFocus {...field} />}
        </FormField>
        <SubmitButton pending={form.formState.isSubmitting} className="w-full">
          Continuer
        </SubmitButton>
      </FieldGroup>
    </form>
  );
}

function PhysicalStep({
  defaultValues,
  onBack,
  onDone,
}: {
  defaultValues: Partial<PhysicalInput>;
  onBack: () => void;
  onDone: () => void;
}) {
  const { error, reset, handle } = useStepError();
  const form = useForm<PhysicalInput>({ resolver: zodResolver(physicalSchema), defaultValues });

  const onSubmit = form.handleSubmit(async (values) => {
    reset();
    const result = await savePhysicalAction(values);
    if (handle(result)) onDone();
    else if (!result.ok) applyServerErrors(form.setError, result.fieldErrors);
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormAlert message={error} />
        <PhysicalFields control={form.control} />
        <StepButtons onBack={onBack} pending={form.formState.isSubmitting} />
      </FieldGroup>
    </form>
  );
}

function CalendarStep({ defaultValue, onBack }: { defaultValue?: string; onBack: () => void }) {
  const { error, reset, handle } = useStepError();
  const [skipping, startSkip] = useTransition();
  const form = useForm<CalendarUrlInput>({
    resolver: zodResolver(calendarUrlSchema),
    defaultValues: { url: defaultValue ?? "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    reset();
    // En cas de succès, l'action termine l'onboarding et redirige vers le planning.
    const result = await saveCalendarUrlAction(values);
    if (!handle(result) && result && !result.ok) applyServerErrors(form.setError, result.fieldErrors);
  });

  const skip = () =>
    startSkip(async () => {
      reset();
      handle(await completeOnboardingAction());
    });

  const busy = form.formState.isSubmitting || skipping;

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FormAlert message={error} />
        <FormField
          control={form.control}
          name="url"
          label="Lien iCal de ton emploi du temps"
          description={
            <>
              Sur ADE ou ton ENT, cherche « Exporter », « Synchroniser » ou « iCal », puis copie le lien
              (il se termine souvent par <code>.ics</code> ou commence par <code>webcal://</code>). Tu pourras
              aussi importer un fichier .ics plus tard depuis le Planning.
            </>
          }
        >
          {(field) => (
            <Input type="url" inputMode="url" autoCapitalize="none" placeholder="https://…" {...field} />
          )}
        </FormField>

        <StepButtons onBack={onBack} pending={form.formState.isSubmitting} disabled={busy} submitLabel="Terminer" />
        <Button type="button" variant="ghost" className="w-full" onClick={skip} disabled={busy}>
          Passer cette étape
        </Button>
      </FieldGroup>
    </form>
  );
}

function StepButtons({
  onBack,
  pending,
  disabled,
  submitLabel = "Continuer",
}: {
  onBack: () => void;
  pending: boolean;
  disabled?: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-3">
      <Button type="button" variant="outline" onClick={onBack} disabled={pending || disabled} aria-label="Étape précédente">
        <ArrowLeft aria-hidden />
        Retour
      </Button>
      <SubmitButton pending={pending} disabled={pending || disabled}>
        {submitLabel}
      </SubmitButton>
    </div>
  );
}
