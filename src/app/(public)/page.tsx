import {
  ArrowRight,
  CalendarDays,
  Check,
  Minus,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { withGuestPage } from '@/lib/auth/server/withGuestPage'
import { Button } from '@/shared/components/ui'
import { AuthProductPreview } from '@/features/auth/components/AuthProductPreview'

const pillars = [
  { icon: CalendarDays, title: 'Tout retrouve sa place', description: 'Soins, rendez-vous et souvenirs s’organisent dans un quotidien lisible.' },
  { icon: UsersRound, title: 'Chacun sait quoi faire', description: 'Les bonnes informations arrivent aux bonnes personnes, au bon moment.' },
  { icon: ShieldCheck, title: 'Une mémoire qui rassure', description: 'L’historique reste daté, compréhensible et disponible quand il compte.' },
] as const

const comparisonRows = [
  { label: 'Gestion d’animaux', free: true },
  { label: 'Gestion de tâches', free: true },
  { label: 'Gestion des objectifs', free: true },
  { label: 'Planification et suivi des événements', free: true },
  { label: 'Rappels des événements', free: true },
  { label: 'Gestion de plus de trois animaux', free: false },
  { label: 'Partage des tâches avec d’autres membres', free: false },
  { label: 'Suivi du budget', free: false },
  { label: 'Suivi de l’alimentation', free: false },
  { label: 'Statistiques d’activités', free: false },
  { label: 'Gestion du dossier médical', free: false },
  { label: 'Enregistrement GPS lors des activités', free: false },
  { label: 'Suivi de l’évolution physique de l’animal', free: false },
] as const

export default async function HomePage() {
  return withGuestPage(async () => (
    <main className="min-h-dvh overflow-hidden bg-background text-foreground">
      <header className="relative z-20 mx-auto flex h-20 w-full max-w-[1480px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="group flex items-center gap-2.5 rounded-control outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <span className="grid size-14 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/10 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105 motion-reduce:transition-none">
            <Image src="/logo.png" alt="" width={48} height={48} className="size-12 object-contain" priority />
          </span>
          <span className="text-lg font-bold tracking-[0.12em]">VASCO</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Accès public">
          <Button asChild variant="ghost" className="hidden sm:inline-flex"><Link href="/login">Se connecter</Link></Button>
          <Button asChild className="rounded-full px-4 sm:px-5"><Link href="/register">Créer mon espace</Link></Button>
        </nav>
      </header>

      <section className="relative mx-auto grid w-full max-w-[1480px] gap-12 px-5 pb-20 pt-10 sm:px-8 sm:pt-14 lg:min-h-[760px] lg:grid-cols-[minmax(0,0.92fr)_minmax(560px,1.08fr)] lg:items-center lg:gap-16 lg:px-12 lg:pb-24 lg:pt-12">
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-0 size-[420px] rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="relative z-10 max-w-[650px]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border bg-card/90 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur">
            <Sparkles aria-hidden="true" className="size-3.5" />
            Retrouvez simplement le quotidien de vos animaux.
          </div>
          <h1 className="text-[clamp(3rem,6.7vw,6.5rem)] font-semibold leading-[0.94] tracking-[-0.055em]">
            Moins de charge mentale,
            <span className="mt-1 block font-normal italic text-primary">plus de moments pour votre animal.</span>
          </h1>
          <p className="mt-8 max-w-[590px] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Vasco réunit les soins, les rendez-vous, les objectifs et les personnes qui comptent dans un espace aussi simple à consulter qu’agréable à utiliser.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="group rounded-full px-6">
              <Link href="/register">Commencer avec Vasco <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" /></Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="rounded-full border px-6">
              <Link href="/login">J’ai déjà un compte</Link>
            </Button>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground" aria-label="Fonctionnalités principales">
            {['Agenda partagé', 'Suivi sur mesure', 'Tous vos animaux'].map((label) => (
              <span key={label} className="inline-flex items-center gap-2"><Check aria-hidden="true" className="size-4 text-primary" />{label}</span>
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[680px] lg:mx-0">
          <div aria-hidden="true" className="absolute -right-28 -top-24 size-80 rounded-full bg-[var(--event-concours)]/20 blur-3xl" />
          <div className="relative min-h-[700px] sm:min-h-[670px]">
            <section className="absolute inset-x-0 top-0 overflow-hidden rounded-[32px] border bg-background/95 p-4 shadow-[0_32px_90px_-38px_color-mix(in_srgb,var(--primary)_45%,transparent)] backdrop-blur sm:p-6" aria-label="Aperçu de Vasco">
              <AuthProductPreview showWeather />
            </section>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/35" aria-label="Pourquoi choisir Vasco">
        <div className="mx-auto grid w-full max-w-[1480px] divide-y px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-12">
          {pillars.map(({ icon: Icon, title, description }, index) => (
            <article key={title} className="group py-8 md:px-7 md:py-10 first:md:pl-0 last:md:pr-0">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border bg-card text-primary shadow-sm transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none"><Icon aria-hidden="true" className="size-5" /></span>
                <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">0{index + 1}</p><h2 className="mt-1 text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1480px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28" aria-labelledby="plans-title">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Les offres Vasco</p>
          <h2 id="plans-title" className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">Choisissez votre expérience</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">Les fonctions essentielles restent disponibles gratuitement. Premium accompagne les usages plus avancés.</p>
        </div>
        <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-[28px] border bg-card shadow-surface" role="region" aria-label="Comparatif des offres Gratuit et Premium" tabIndex={0}>
          <div className="grid grid-cols-[minmax(0,1fr)_78px_88px] items-center border-b bg-muted/55 px-4 py-4 text-xs font-bold sm:grid-cols-[minmax(0,1fr)_140px_160px] sm:px-6 sm:text-sm">
            <span>Fonctionnalité</span><span className="text-center">Gratuit</span><span className="text-center text-primary">Premium</span>
          </div>
          <div className="divide-y">
            {comparisonRows.map((row) => (
              <div key={row.label} className="grid min-h-14 grid-cols-[minmax(0,1fr)_78px_88px] items-center px-4 py-3 text-sm transition-colors hover:bg-muted/35 sm:grid-cols-[minmax(0,1fr)_140px_160px] sm:px-6">
                <span className="pr-3 font-medium leading-5">{row.label}</span>
                <span className="flex justify-center">{row.free ? <><Check aria-hidden="true" className="size-5 text-success" /><span className="sr-only">Inclus dans l’offre gratuite</span></> : <><Minus aria-hidden="true" className="size-5 text-muted-foreground" /><span className="sr-only">Non inclus dans l’offre gratuite</span></>}</span>
                <span className="flex justify-center"><span className="grid size-7 place-items-center rounded-full bg-primary/10"><Check aria-hidden="true" className="size-4 text-primary" /></span><span className="sr-only">Inclus dans l’offre Premium</span></span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex justify-center"><Button asChild size="lg" className="rounded-full px-6"><Link href="/register">Commencer gratuitement <ArrowRight aria-hidden="true" /></Link></Button></div>
      </section>

      <section className="mx-auto w-full max-w-[1480px] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="relative overflow-hidden rounded-[32px] bg-primary px-6 py-12 text-primary-foreground shadow-overlay sm:px-10 lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12 lg:px-16 lg:py-16">
          <div aria-hidden="true" className="absolute -right-16 -top-32 size-80 rounded-full border border-primary-foreground/10" />
          <div aria-hidden="true" className="absolute -right-4 -top-20 size-52 rounded-full border border-primary-foreground/10" />
          <div className="relative max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">Prendre soin, simplement</p><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Un espace calme pour des journées qui ne le sont pas toujours.</h2><p className="mt-4 max-w-xl text-sm leading-6 opacity-75 sm:text-base">Commencez à votre rythme, ajoutez vos animaux et retrouvez enfin une vue claire de ce qui compte.</p></div>
          <Button asChild size="lg" variant="secondary" className="relative mt-8 rounded-full px-6 lg:mt-0"><Link href="/register">Créer mon espace <ArrowRight aria-hidden="true" /></Link></Button>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-4 px-5 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <span className="font-semibold tracking-[0.12em] text-foreground">VASCO</span>
          <span>Le quotidien de vos animaux, réuni avec soin.</span>
          <span>© 2026 Vasco</span>
        </div>
      </footer>
    </main>
  ))
}
