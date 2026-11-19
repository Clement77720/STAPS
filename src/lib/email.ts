/**
 * email.ts — Envoi d'emails transactionnels (réinitialisation du mot de passe).
 *
 * Fournisseur : Resend (https://resend.com), appelé directement via son API HTTP
 * (pas de SDK nécessaire). Configuration par variables d'environnement :
 *  - RESEND_API_KEY : clé API Resend ;
 *  - EMAIL_FROM     : expéditeur, ex. "STAPS <onboarding@resend.dev>".
 *    L'adresse de test `onboarding@resend.dev` ne peut écrire qu'à l'email du
 *    compte Resend : suffisant pour un usage perso, sinon vérifier un domaine.
 *
 * Sans RESEND_API_KEY (développement), l'email n'est pas envoyé : son contenu
 * est affiché dans la console du serveur pour pouvoir cliquer sur le lien.
 */
import "server-only";

type Email = { to: string; subject: string; text: string; html: string };

export async function sendEmail(email: Email): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    const level = process.env.NODE_ENV === "production" ? "error" : "info";
    console[level](
      `[email] RESEND_API_KEY absente : email non envoyé.\n  À : ${email.to}\n  Objet : ${email.subject}\n\n${email.text}\n`,
    );
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "STAPS <onboarding@resend.dev>",
      to: [email.to],
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
  });

  if (!response.ok) {
    // On journalise sans relancer : l'utilisateur voit toujours le même message
    // ("si un compte existe, un email a été envoyé"), on ne révèle rien.
    console.error(`[email] Échec de l'envoi via Resend (${response.status}) :`, await response.text());
  }
}

/** Email de réinitialisation du mot de passe (texte + HTML minimal). */
export function resetPasswordEmail(params: { to: string; url: string }): Email {
  const text = [
    "Bonjour,",
    "",
    "Tu as demandé à réinitialiser ton mot de passe. Clique sur ce lien (valable 1 heure) :",
    params.url,
    "",
    "Si tu n'es pas à l'origine de cette demande, ignore simplement cet email.",
  ].join("\n");

  const html = `<!doctype html><html lang="fr"><body style="font-family:system-ui,sans-serif;color:#0b1a33;line-height:1.5">
<p>Bonjour,</p>
<p>Tu as demandé à réinitialiser ton mot de passe. Ce lien est valable 1&nbsp;heure :</p>
<p><a href="${params.url}" style="display:inline-block;background:#14306b;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:600">Choisir un nouveau mot de passe</a></p>
<p style="color:#5b6b85;font-size:14px">Si tu n'es pas à l'origine de cette demande, ignore simplement cet email.</p>
</body></html>`;

  return { to: params.to, subject: "Réinitialise ton mot de passe", text, html };
}
