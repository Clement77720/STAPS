/**
 * nav-items.ts — Les 4 onglets de la navigation principale (brief §3).
 * Partagé par la barre du bas (mobile) et la sidebar (desktop).
 */
import { CalendarDays, HeartPulse, UserRound, UtensilsCrossed, type LucideIcon } from "lucide-react";

export type NavItem = {
  /** Segment de route sous /app (sert aussi à détecter l'onglet actif). */
  segment: "planning" | "bien-etre" | "repas" | "profil";
  href: "/app/planning" | "/app/bien-etre" | "/app/repas" | "/app/profil";
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { segment: "planning", href: "/app/planning", label: "Planning", icon: CalendarDays },
  { segment: "bien-etre", href: "/app/bien-etre", label: "Bien-être", icon: HeartPulse },
  { segment: "repas", href: "/app/repas", label: "Repas", icon: UtensilsCrossed },
  { segment: "profil", href: "/app/profil", label: "Profil", icon: UserRound },
];
