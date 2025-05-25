'use client';

import { useEffect, useState } from 'react';
import { sendVerificationEmail } from '@/lib/firebaseService';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

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
    <main style={{ padding: '2rem', maxWidth: 500, margin: 'auto', textAlign: 'center' }}>
      <h1>Confirme ton adresse e-mail</h1>
      <p>
        Nous avons envoyé un e-mail de confirmation à <strong>{auth.currentUser?.email}</strong>.
        Clique sur le lien dans cet e-mail pour activer ton compte.
      </p>

      {verified && <p style={{ color: 'green' }}>✅ Adresse confirmée, redirection en cours...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!verified && (
        <>
          {emailSent && <p style={{ color: 'green' }}>E-mail de confirmation renvoyé.</p>}
          <button
            onClick={handleSendEmail}
            disabled={cooldown > 0 || redirecting}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              fontWeight: 'bold',
              cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {cooldown > 0
              ? `Réessaie dans ${cooldown}s`
              : `Renvoyer l'e-mail de confirmation`}
          </button>
        </>
      )}
    </main>
  );
}
