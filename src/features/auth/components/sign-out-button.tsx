"use client";

/**
 * Bouton de déconnexion (appelle la Server Action signOutAction).
 */
import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { signOutAction } from "../actions";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button variant="outline" className="w-full" disabled={pending} onClick={() => startTransition(() => signOutAction())}>
      {pending ? <Spinner aria-hidden /> : <LogOut aria-hidden />}
      Se déconnecter
    </Button>
  );
}
