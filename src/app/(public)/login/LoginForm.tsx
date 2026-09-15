'use client';

import { FormEvent, useState } from 'react';
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { signInUser, isEmailVerified } from '@/lib/firebaseService';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import Link from 'next/link';
import { establishAuthenticatedSession } from '@/features/user/api/user-api';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthShell } from '@/shared/components/layout/AuthShell';
import { safeReturnPath } from '@/shared/security/safe-return-path';

export default function LoginForm() {
        const router = useRouter();
        const searchParams = useSearchParams();
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [showPassword, setShowPassword] = useState(false);
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
                        const returnTo = searchParams.get('returnTo');
                        router.replace(safeReturnPath(returnTo));
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
          <AuthShell>
            <div className="w-full max-w-[460px]">
              <div className="mb-9">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Bienvenue</p>
                <h1 className="mt-3 text-[clamp(2.5rem,5vw,4rem)] font-semibold leading-[0.98] tracking-[-0.045em]">Ravi de vous<br />retrouver.</h1>
                <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">Connectez-vous pour reprendre le fil du quotidien de vos animaux.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5" aria-busy={loading}>
                  <div className="space-y-2">
                    <label htmlFor="login-email" className="text-sm font-semibold">Adresse e-mail</label>
                    <div className="relative">
                      <Mail aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      inputMode="email"
                      placeholder="vous@exemple.fr"
                      size="large"
                      className="rounded-[14px] bg-card pl-11! text-base! shadow-xs"
                    />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="login-password" className="text-sm font-semibold">Mot de passe</label>
                    <div className="relative">
                      <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        placeholder="Votre mot de passe"
                        size="large"
                        className="rounded-[14px] bg-card px-11! text-base! shadow-xs"
                      />
                      <button type="button" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)} className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">
                        {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
                      </button>
                    </div>
                  </div>
                  {error && <p role="alert" className="flex items-start gap-2 rounded-[14px] border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"><AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{error}</p>}
                  <Button type="submit" size="lg" className="group w-full rounded-full" disabled={loading}>
                    {loading ? 'Connexion en cours…' : 'Se connecter'}
                    {!loading && <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />}
                  </Button>
              </form>
              <div className="mt-8 flex items-center gap-3" aria-hidden="true"><span className="h-px flex-1 bg-border" /><span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Première visite ?</span><span className="h-px flex-1 bg-border" /></div>
              <p className="mt-6 rounded-[18px] border bg-card px-5 py-4 text-center text-sm text-muted-foreground shadow-xs">
                  Vous n’avez pas encore d’espace ?{' '}
                  <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    Créer un compte
                  </Link>
              </p>
            </div>
          </AuthShell>
        );
}
