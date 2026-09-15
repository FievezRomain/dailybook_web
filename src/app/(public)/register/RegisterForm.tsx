'use client'

import { AlertCircle, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

import { AuthShell } from '@/shared/components/layout/AuthShell'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { registerUser } from '@/lib/firebaseService'

export default function RegisterForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const passwordsMatch = password.length > 0 && password === passwordConfirmation

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (password !== passwordConfirmation) {
        throw new Error('Les mots de passe ne correspondent pas.')
      }
      await registerUser(email, password, firstName)
      router.replace('/verify-email')
    } catch (caughtError) {
      console.error(caughtError)
      setError(caughtError instanceof Error ? caughtError.message : 'Une erreur inconnue est survenue.')
      setLoading(false)
    }
  }

  return (
    <AuthShell variant="register">
      <div className="w-full max-w-[600px]">
        <div className="mb-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Bienvenue chez Vasco</p>
          <h1 className="mt-3 text-[clamp(2.5rem,5vw,3.75rem)] font-semibold leading-[0.98] tracking-[-0.045em]">Créons votre<br />espace.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">Quatre informations suffisent. Vous pourrez personnaliser le reste tranquillement ensuite.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" aria-busy={loading}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="register-first-name" className="text-sm font-semibold">Prénom</label>
              <div className="relative">
                <UserRound aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="register-first-name" type="text" value={firstName} onChange={event => setFirstName(event.target.value)} required autoComplete="given-name" placeholder="Votre prénom" size="large" className="rounded-[14px] bg-card pl-11! text-base! shadow-xs" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="register-email" className="text-sm font-semibold">Adresse e-mail</label>
              <div className="relative">
                <Mail aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="register-email" type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" inputMode="email" placeholder="vous@exemple.fr" size="large" className="rounded-[14px] bg-card pl-11! text-base! shadow-xs" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="register-password" className="text-sm font-semibold">Mot de passe</label>
              <div className="relative">
                <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="register-password" type={showPasswords ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} required autoComplete="new-password" placeholder="6 caractères minimum" size="large" className="rounded-[14px] bg-card px-11! text-base! shadow-xs" />
                <button type="button" aria-label={showPasswords ? 'Masquer les mots de passe' : 'Afficher les mots de passe'} aria-pressed={showPasswords} onClick={() => setShowPasswords(value => !value)} className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  {showPasswords ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="register-password-confirmation" className="text-sm font-semibold">Confirmer le mot de passe</label>
              <div className="relative">
                <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="register-password-confirmation" type={showPasswords ? 'text' : 'password'} value={passwordConfirmation} onChange={event => setPasswordConfirmation(event.target.value)} required autoComplete="new-password" placeholder="Saisissez-le à nouveau" size="large" aria-describedby={passwordsMatch ? 'password-match' : undefined} className="rounded-[14px] bg-card px-11! text-base! shadow-xs" />
                {passwordsMatch && <span id="password-match" className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-success text-success-foreground"><Check aria-hidden="true" className="size-3.5" /><span className="sr-only">Les mots de passe correspondent</span></span>}
              </div>
            </div>
          </div>

          {error && <p role="alert" className="flex items-start gap-2 rounded-[14px] border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"><AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{error}</p>}

          <Button size="lg" type="submit" className="group w-full rounded-full" disabled={loading}>
            {loading ? 'Inscription en cours…' : 'Créer mon espace'}
            {!loading && <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />}
          </Button>
        </form>

        <div className="mt-7 flex items-center gap-3" aria-hidden="true"><span className="h-px flex-1 bg-border" /><span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Déjà parmi nous ?</span><span className="h-px flex-1 bg-border" /></div>
        <p className="mt-5 rounded-[18px] border bg-card px-5 py-4 text-center text-sm text-muted-foreground shadow-xs">
          Votre espace existe déjà ?{' '}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Se connecter</Link>
        </p>
      </div>
    </AuthShell>
  )
}
