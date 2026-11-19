/**
 * Layout racine : <html> en français, polices, thème clair/sombre et notifications.
 * Commun à toutes les pages (landing, auth, espace connecté).
 */
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/site";
import "./globals.css";

// Polices auto-hébergées par next/font (aucune requête vers Google côté visiteur).
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "default" },
  // Empêche iOS de transformer les nombres (poids, kcal…) en liens téléphone.
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // `cover` + env(safe-area-inset-*) : le contenu évite l'encoche et la barre d'accueil iOS.
  viewportFit: "cover",
  // Couleur de la barre du navigateur mobile, alignée sur --background.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#060d1a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning : next-themes ajoute la classe `dark` sur <html>
    // avant l'hydratation, ce qui est voulu (évite le flash de thème).
    <html lang="fr" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-dvh">
        <ThemeProvider>
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
