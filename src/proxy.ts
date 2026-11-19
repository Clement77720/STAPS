/**
 * proxy.ts (ex-"middleware" avant Next 16) — exécuté avant le rendu des routes protégées.
 *
 * Contrôle "optimiste" : on vérifie seulement la PRÉSENCE du cookie de session
 * (sans requête BDD) pour rediriger tout de suite les visiteurs non connectés
 * vers /login. La vérification réelle de la session est faite côté serveur
 * dans src/lib/dal.ts.
 */
import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    // Pour revenir sur la page demandée après connexion.
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/onboarding"],
};
