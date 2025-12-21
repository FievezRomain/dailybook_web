'use client';

import { useEffect, useState } from 'react';
import { sendVerificationEmail } from '@/lib/firebaseService';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function VerifyEmailClient() {
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleSendEmail = async () => {
    setError(null);
    try {
      await sendVerificationEmail();
      setEmailSent(true);
      setCooldown(60);
    } catch (err) {
      setError("Erreur lors de l'envoi de l'e-mail. Réessaie plus tard.");
    }
  };

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    const checkVerification = async () => {
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        setVerified(true);
        setRedirecting(true);

        try {
          const idToken = await auth.currentUser.getIdToken(true);
          const res = await fetch('/api/session/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          if (!res.ok) {
            throw new Error('Erreur lors de la création du cookie de session');
          }

          setTimeout(() => router.push('/dashboard'), 1500);
        } catch (err) {
          setError("Erreur lors de la connexion après validation. Réessaie.");
          setRedirecting(false);
        }
      }
    };

    const interval = setInterval(checkVerification, 3000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-lg rounded-3xl bg-[var(--card)] px-6 py-8 shadow-lg md:px-8 md:py-9">
        {/* En-tête */}
        <header className="mb-6 space-y-2 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--color-alezan-transparent))]">
            <span className="text-lg font-semibold text-[rgb(var(--color-baie))]">
              @
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Confirme ton adresse e-mail
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Nous t’avons envoyé un lien de validation pour activer ton compte Vasco and co.
          </p>
        </header>

        {/* Corps */}
        <section className="space-y-4 text-sm text-[var(--foreground)] text-center">
          <p>
            E-mail envoyé à{' '}
            <span className="font-medium">
              {auth.currentUser?.email ?? 'ton adresse e-mail'}
            </span>
            .<br />
            Clique sur le lien reçu pour finaliser ton inscription.
          </p>

          {verified && (
            <p className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
              Adresse confirmée, redirection en cours...
            </p>
          )}

          {error && (
            <p className="rounded-xl border border-[rgba(var(--color-error),0.35)] bg-[rgba(var(--color-error),0.08)] px-3 py-2 text-xs text-[rgb(var(--color-error))]">
              {error}
            </p>
          )}

          {!verified && (
            <div className="space-y-3 pt-2">
              {emailSent && (
                <p className="text-xs text-emerald-400">
                  E-mail de confirmation renvoyé.
                </p>
              )}

              <Button
                type="button"
                onClick={handleSendEmail}
                disabled={cooldown > 0 || redirecting}
                size="lg"
                className="w-full"
              >
                {cooldown > 0
                  ? `Réessaie dans ${cooldown}s`
                  : "Renvoyer l'e-mail de confirmation"}
              </Button>

              <p className="text-[11px] text-[var(--muted-foreground)]">
                Pense à vérifier aussi dans tes spams ou courriers indésirables.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
