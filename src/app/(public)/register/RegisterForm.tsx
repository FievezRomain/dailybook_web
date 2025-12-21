'use client';

import { FormEvent, useState } from 'react';
import styles from '@/styles/pages/register.module.scss';
import { registerUser } from '@/lib/firebaseService';
import { Button } from '@/components/ui';
import Link from 'next/link';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      await registerUser(email, password);
      window.location.href = '/verify-email';
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur inconnue est survenue.');
      }

      setLoading(false);
    }
  };

  return (
    <div className={styles.form_page}>
      <div className="w-full max-w-xl rounded-3xl bg-[var(--card)] px-6 py-8 shadow-lg md:px-8">
        <header className="mb-8 space-y-2 text-center md:text-left">
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Créer un compte
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Rejoignez Vasco and co et commencez à organiser vos journées.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-[var(--muted-foreground)]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="votre.email@exemple.com"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              />
            </div>

            {/* Prénom */}
            <div className="space-y-1.5">
              <label
                htmlFor="firstname"
                className="text-xs font-medium text-[var(--muted-foreground)]"
              >
                Prénom
              </label>
              <input
                id="firstname"
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                placeholder="Votre prénom"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              />
            </div>

            {/* Mot de passe */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-[var(--muted-foreground)]"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Mot de passe"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              />
            </div>

            {/* Confirmation mot de passe */}
            <div className="space-y-1.5">
              <label
                htmlFor="passwordConfirm"
                className="text-xs font-medium text-[var(--muted-foreground)]"
              >
                Confirmation du mot de passe
              </label>
              <input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                required
                placeholder="Confirmation du mot de passe"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs rounded-xl border border-[rgba(var(--color-error),0.35)] bg-[rgba(var(--color-error),0.08)] px-3 py-2 text-[rgb(var(--color-error))]">
              {error}
            </p>
          )}

          <div className="pt-2">
            <Button
              size="lg"
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Inscription...' : 'S’enregistrer'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-[var(--muted-foreground)]">
            Vous avez déjà un compte ?{' '}
          </span>
          <Link
            href="/login"
            className="font-medium text-[var(--primary)] hover:underline"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
