'use client';

import { useEffect, useState } from 'react';
import { sendVerificationEmail } from '@/lib/firebaseService';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { establishAuthenticatedSession } from '@/features/user/api/user-api';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/shared/components/ui/card';

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
    } catch {
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
          await establishAuthenticatedSession(auth.currentUser);

          setTimeout(() => router.push('/dashboard'), 1500);
        } catch {
          setError("Erreur lors de la connexion après validation. Réessaie.");
          setRedirecting(false);
        }
      }
    };

    const interval = setInterval(checkVerification, 3000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <main className="grid min-h-[calc(100dvh-5rem)] place-items-center px-page-gutter pb-page-gutter">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <h1 className="text-page-title font-semibold leading-none">Confirmez votre adresse e-mail</h1>
          <CardDescription>
            Un lien de confirmation a été envoyé{auth.currentUser?.email ? <> à <strong className="text-foreground">{auth.currentUser.email}</strong></> : ''}.
            Ouvrez-le pour activer votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-section">
          <div aria-live="polite" aria-atomic="true">
            {verified && <p className="text-sm font-medium text-success">Adresse confirmée. Redirection en cours…</p>}
            {emailSent && !verified && <p className="text-sm font-medium text-success">E-mail de confirmation renvoyé.</p>}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          </div>
          {!verified && (
            <Button type="button" size="lg" className="w-full sm:w-auto" onClick={handleSendEmail} disabled={cooldown > 0 || redirecting}>
              {cooldown > 0 ? `Réessayer dans ${cooldown} s` : "Renvoyer l’e-mail de confirmation"}
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
