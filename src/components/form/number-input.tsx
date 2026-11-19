"use client";

/**
 * NumberInput — saisie d'un nombre adaptée au mobile et au format français.
 *
 * On utilise un <input type="text" inputMode="decimal"> plutôt que type="number" :
 * le clavier numérique s'affiche, et la virgule ("72,5") est acceptée partout
 * (type="number" la rejette selon les navigateurs).
 *
 * Le texte tapé est conservé tel quel tant qu'il correspond à la valeur du
 * formulaire (ex. "72," pendant la frappe) ; si la valeur change de l'extérieur
 * (réinitialisation), l'affichage suit.
 */
import { useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";

/** "72,5" → 72.5 ; "" ou texte invalide → undefined. */
export function parseFrenchNumber(text: string): number | undefined {
  const normalized = text.trim().replace(/\s/g, "").replace(",", ".");
  if (normalized === "") return undefined;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

export function NumberInput({
  value,
  onChange,
  decimal = false,
  ...props
}: Omit<ComponentProps<"input">, "value" | "onChange" | "type"> & {
  value: number | null | undefined;
  onChange: (value: number | undefined) => void;
  /** Autorise les décimales (clavier avec virgule). */
  decimal?: boolean;
}) {
  const [text, setText] = useState(() => (value == null ? "" : String(value).replace(".", ",")));
  const display = parseFrenchNumber(text) === (value ?? undefined) ? text : value == null ? "" : String(value).replace(".", ",");

  return (
    <Input
      type="text"
      inputMode={decimal ? "decimal" : "numeric"}
      autoComplete="off"
      className="tabular-nums"
      {...props}
      value={display}
      onChange={(event) => {
        setText(event.target.value);
        onChange(parseFrenchNumber(event.target.value));
      }}
    />
  );
}
