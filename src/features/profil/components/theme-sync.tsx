"use client";

/**
 * ThemeSync — applique le thème enregistré dans le profil (BDD) s'il diffère
 * de celui mémorisé sur cet appareil (localStorage). Permet de retrouver son
 * thème en se connectant depuis un nouvel appareil. Ne rend rien.
 */
import { useTheme } from "next-themes";
import { useEffect } from "react";
import type { ThemePreference } from "../options";

export function ThemeSync({ theme }: { theme: ThemePreference }) {
  const { theme: current, setTheme } = useTheme();
  useEffect(() => {
    if (current && current !== theme) setTheme(theme);
    // On ne réagit qu'au thème du profil : `current` change aussi quand
    // l'utilisateur bascule lui-même (choix déjà enregistré en BDD).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);
  return null;
}
