'use client';

import { useEffect, useState } from 'react';
import { sendVerificationEmail } from '@/lib/firebaseService';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { establishAuthenticatedSession } from '@/features/user/api/user-api';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/shared/components/ui/card';
import { AuthStatusShell } from '@/shared/components/layout/AuthShell';
import { AtSign } from 'lucide-react';
import Link from 'next/link';

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
    <AuthStatusShell>
      <Card className="w-full max-w-[400px] rounded-[20px] p-2 text-center shadow-surface sm:p-3">
        <CardHeader>
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent text-primary"><AtSign aria-hidden="true" className="size-6" /></span>
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
            <div className="grid justify-items-center gap-4">
              <Button type="button" size="lg" className="w-full" onClick={handleSendEmail} disabled={cooldown > 0 || redirecting}>
                {cooldown > 0 ? `Réessayer dans ${cooldown} s` : "Renvoyer l’e-mail"}
              </Button>
              <Link href="/register" className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Changer d’adresse
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthStatusShell>
  );
}
