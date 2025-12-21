'use client';

import { FormEvent, useState } from 'react';
import { getIdToken } from 'firebase/auth';
import styles from '@/styles/pages/login.module.scss';
import { signInUser, isEmailVerified } from '@/lib/firebaseService';
import { Button } from '@/components/ui';
import Link from 'next/link';

export default function LoginForm() {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState<string | null>(null);
        const [loading, setLoading] = useState(false);

        const handleSubmit = async (e: FormEvent) => {
                e.preventDefault();
                setError(null);
                setLoading(true);

                try {
                        // 1. Authentification avec Firebase
                        const userCredential = await signInUser(email, password);
                        const user = userCredential.user;

                        // Vérification si l'utilisateur a son email validée
                        const verified = await isEmailVerified();
                        if (!verified) {
                                window.location.href = '/verify-email';
                                return;
                        }

                        // 2. Récupérer le idToken
                        const idToken = await getIdToken(user, true);

                        // 3. Envoyer ce token à l’API pour créer le cookie
                        const res = await fetch('/api/session/login', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ idToken: idToken }),
                        });

                        if (!res.ok) {
                                throw new Error('Erreur lors de la création du cookie de session');
                        }

                        // 4. Rediriger
                        window.location.href = '/dashboard';
                } catch (err) {
                        console.error(err);
                        if (err instanceof Error) {
                                setError(err.message);
                        } else {
                                setError("Email ou mot de passe incorrect");
                        }
                        setLoading(false);
                }
        };

        return (
                <div className={`${styles.page}`}>
                        <div className={`${styles.layout} shadow-lg`}>
                                {/* PANEL GAUCHE */}
                                <section
                                        className={`${styles.panel} flex flex-col justify-between`}
                                        style={{
                                                background: `linear-gradient(
                                                        135deg,
                                                        rgba(var(--color-baie), 1),
                                                        rgba(var(--color-alezan), 1),
                                                        rgba(var(--color-primary), 1)
                                                        )`,
                                        }}
                                >
                                        <div className="max-w-md space-y-6">
                                                <div className="flex items-center gap-3">
                                                        <img src="/logo.png" alt="Logo" className="h-15 w-auto" />
                                                        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[rgba(var(--color-background),0.85)]">
                                                                Vasco and co
                                                        </p>
                                                </div>

                                                <div className="space-y-3 text-[rgba(var(--color-background),1)]">
                                                        <h1 className="text-2xl md:text-[1.9rem] font-semibold leading-snug">
                                                                Bienvenue dans votre journal quotidien
                                                        </h1>
                                                        <p className="text-sm leading-relaxed opacity-90">
                                                                Centralisez vos événements, vos notes, vos objectifs et bien plus
                                                                encore dans un espace clair, simple et sécurisé.
                                                        </p>
                                                </div>
                                        </div>

                                        <div className="mt-10 space-y-2 max-w-md">
                                                <p className="text-sm text-[rgba(var(--color-background),0.9)]">
                                                        Pas encore de compte ?
                                                </p>
                                                <Button
                                                        asChild
                                                        size="lg"
                                                        className="w-full bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--card)]/90 border border-[var(--border)]"
                                                >
                                                        <Link href="/register">Créer mon compte</Link>
                                                </Button>
                                        </div>
                                </section>

                                {/* PANEL DROIT */}
                                <section className={`${styles.panel} bg-[var(--card)] text-[var(--foreground)]`}>
                                        {/* card = bloc centré verticalement avec espace au‑dessus et au‑dessous */}
                                        <div className="mx-auto flex h-full w-full max-w-xl flex-col justify-center">
                                                <div className="space-y-2 mb-8">
                                                        <h2 className="text-2xl font-semibold">Connexion</h2>
                                                        <p className="text-sm text-[var(--muted-foreground)]">
                                                                Accédez à votre espace personnel
                                                        </p>
                                                </div>

                                                <form onSubmit={handleSubmit} className="space-y-4">
                                                        <div className="space-y-1.5">
                                                                <label
                                                                        htmlFor="email"
                                                                        className="text-xs font-medium text-[var(--muted-foreground)]"
                                                                >
                                                                        Identifiant
                                                                </label>
                                                                <input
                                                                        id="email"
                                                                        type="email"
                                                                        value={email}
                                                                        onChange={e => setEmail(e.target.value)}
                                                                        placeholder="votre.email@exemple.com"
                                                                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                                                                        required
                                                                />
                                                        </div>

                                                        <div className="space-y-1.5">
                                                                <div className="flex items-center justify-between text-xs">
                                                                        <label
                                                                                htmlFor="password"
                                                                                className="font-medium text-[var(--muted-foreground)]"
                                                                        >
                                                                                Mot de passe
                                                                        </label>
                                                                        <button
                                                                                type="button"
                                                                                className="border-none bg-none p-0 text-[var(--primary)] hover:underline"
                                                                        >
                                                                                Mot de passe oublié ?
                                                                        </button>
                                                                </div>
                                                                <input
                                                                        id="password"
                                                                        type="password"
                                                                        value={password}
                                                                        onChange={e => setPassword(e.target.value)}
                                                                        placeholder="Votre mot de passe"
                                                                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                                                                        required
                                                                />
                                                        </div>

                                                        {error && (
                                                                <p className="text-xs rounded-xl border border-[rgba(var(--color-error),0.35)] bg-[rgba(var(--color-error),0.08)] px-3 py-2 text-[rgb(var(--color-error))]">
                                                                {error}
                                                                </p>
                                                        )}

                                                        {/* bouton aligné verticalement avec celui de gauche grâce au flex column + space-between du panel */}
                                                        <div className="pt-4">
                                                                <Button
                                                                        type="submit"
                                                                        size="lg"
                                                                        disabled={loading}
                                                                        className="w-full"
                                                                >
                                                                        {loading ? 'Connexion...' : 'Je me connecte'}
                                                                </Button>
                                                        </div>
                                                </form>
                                        </div>
                                </section>
                        </div>
                </div>
        );
}
