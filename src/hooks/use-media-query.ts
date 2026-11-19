"use client";

/**
 * useMediaQuery — vrai si la media query CSS correspond.
 * Côté serveur (et pendant l'hydratation) on renvoie `false` : le rendu
 * mobile est celui par défaut (mobile first).
 */
import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onChange);
      return () => mediaQueryList.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Même seuil que la navigation : sidebar et dialogs à partir de 1024px. */
export const DESKTOP_QUERY = "(min-width: 1024px)";
