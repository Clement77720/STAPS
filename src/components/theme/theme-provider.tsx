"use client";

/**
 * ThemeProvider — enveloppe next-themes pour gérer clair / sombre / système.
 *
 * - `attribute="class"` : pose la classe `.dark` sur <html> (cf. globals.css).
 * - `defaultTheme="system"` : suit la préférence de l'appareil tant que
 *   l'utilisateur n'a rien choisi.
 * - Le choix est mémorisé dans le localStorage ; next-themes injecte un petit
 *   script qui applique le thème AVANT le premier affichage (pas de flash).
 *   (En Phase 1, le thème sera aussi enregistré dans le profil en BDD.)
 */
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    />
  );
}
