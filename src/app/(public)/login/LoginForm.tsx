'use client';

import { FormEvent, useState } from 'react';
import { signInUser, isEmailVerified } from '@/lib/firebaseService';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import Link from 'next/link';
import { establishAuthenticatedSession } from '@/features/user/api/user-api';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
        const router = useRouter();
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
                                router.replace('/verify-email');
                                return;
                        }

                        // Crée le cookie web puis ouvre la session métier FastAPI.
                        await establishAuthenticatedSession(user);

                        // Rediriger uniquement lorsque les deux sessions sont prêtes.
                        router.replace('/dashboard');
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
          <main className="grid min-h-[calc(100dvh-5rem)] place-items-center px-page-gutter pb-page-gutter">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <h1 className="text-page-title font-semibold leading-none">Connexion</h1>
                <CardDescription>Retrouvez votre espace Vasco.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-section">
                <form onSubmit={handleSubmit} className="space-y-section" aria-busy={loading}>
                  <div className="space-y-control">
                    <label htmlFor="login-email" className="text-sm font-medium">Adresse e-mail</label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      inputMode="email"
                    />
                  </div>
                  <div className="space-y-control">
                    <label htmlFor="login-password" className="text-sm font-medium">Mot de passe</label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? 'Connexion en cours…' : 'Se connecter'}
                  </Button>
                </form>
                <p className="text-center text-sm text-muted-foreground">
                  Pas encore de compte ?{' '}
                  <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    S’inscrire
                  </Link>
                </p>
              </CardContent>
            </Card>
          </main>
        );
}
