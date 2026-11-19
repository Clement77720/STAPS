/**
 * Layout des pages d'authentification (/login, /register, …) :
 * carte centrée, logo en haut, sans la navigation de l'app.
 */
import Link from "next/link";
import { Brand } from "@/components/layout/brand";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <Link href="/" className="rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
        <Brand />
      </Link>
      <main className="w-full max-w-sm">{children}</main>
    </div>
  );
}
