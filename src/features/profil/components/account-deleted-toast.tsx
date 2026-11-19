"use client";

/**
 * Affiche une confirmation sur la landing après la suppression du compte
 * (redirection vers /?compte=supprime). Ne rend rien.
 */
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function AccountDeletedToast() {
  const deleted = useSearchParams().get("compte") === "supprime";
  useEffect(() => {
    if (!deleted) return;
    // Décalé d'un tick : le <Toaster> du layout racine s'abonne aux toasts dans son
    // propre effet, exécuté APRÈS celui-ci ; un toast émis trop tôt serait perdu.
    const timer = setTimeout(() => toast.success("Ton compte et toutes tes données ont été supprimés."), 0);
    return () => clearTimeout(timer);
  }, [deleted]);
  return null;
}
