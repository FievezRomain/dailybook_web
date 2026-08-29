'use client';

import { FormEvent, useState } from 'react';
import { registerUser } from '@/lib/firebaseService';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterForm() {
        const router = useRouter();
        const [email, setEmail] = useState('');
        const [firstName, setFirstName] = useState('');
        const [password, setPassword] = useState('');
        const [passwordConfirmation, setPasswordConfirmation] = useState('');
        const [error, setError] = useState<string | null>(null);
        const [loading, setLoading] = useState(false);

        const handleSubmit = async (e: FormEvent) => {
                e.preventDefault();
                setError(null);
                setLoading(true);

                try {
                        if (password !== passwordConfirmation) {
                                throw new Error('Les mots de passe ne correspondent pas.');
                        }
                        await registerUser(email, password, firstName);

                        router.replace('/verify-email');
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
          <main className="grid min-h-[calc(100dvh-5rem)] place-items-center px-page-gutter pb-page-gutter">
            <Card className="w-full max-w-2xl">
              <CardHeader className="text-center">
                <h1 className="text-page-title font-semibold leading-none">Créer un compte</h1>
                <CardDescription>Commencez à organiser le quotidien de vos animaux.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-section">
                <form onSubmit={handleSubmit} className="space-y-section" aria-busy={loading}>
                  <div className="grid gap-section sm:grid-cols-2">
                    <div className="space-y-control">
                      <label htmlFor="register-email" className="text-sm font-medium">Adresse e-mail</label>
                      <Input id="register-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" inputMode="email" />
                    </div>
                    <div className="space-y-control">
                      <label htmlFor="register-first-name" className="text-sm font-medium">Prénom</label>
                      <Input id="register-first-name" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required autoComplete="given-name" />
                    </div>
                    <div className="space-y-control">
                      <label htmlFor="register-password" className="text-sm font-medium">Mot de passe</label>
                      <Input id="register-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
                    </div>
                    <div className="space-y-control">
                      <label htmlFor="register-password-confirmation" className="text-sm font-medium">Confirmer le mot de passe</label>
                      <Input id="register-password-confirmation" type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} required autoComplete="new-password" />
                    </div>
                  </div>
                  {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                  <Button size="lg" type="submit" className="w-full sm:mx-auto sm:flex sm:w-auto sm:min-w-48" disabled={loading}>
                    {loading ? 'Inscription en cours…' : 'Créer mon compte'}
                  </Button>
                </form>
                <p className="text-center text-sm text-muted-foreground">
                  Vous avez déjà un compte ?{' '}
                  <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    Se connecter
                  </Link>
                </p>
              </CardContent>
            </Card>
          </main>
        );
}
