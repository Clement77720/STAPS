/**
 * /register — page provisoire (Phase 0).
 * Le formulaire Better Auth sera branché en Phase 1.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Inscription" };

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Inscription</CardTitle>
        <CardDescription>Les comptes arrivent en phase 1. En attendant, tu peux parcourir l&apos;aperçu de l&apos;app.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/app/planning">Voir l&apos;aperçu</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
