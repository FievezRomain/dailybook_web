import {
  ArrowRight,
  CalendarDays,
  Check,
  CloudSun,
  Heart,
  Minus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Target,
  UsersRound,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { withGuestPage } from '@/lib/auth/server/withGuestPage'
import { Button } from '@/shared/components/ui'

const dayEvents = [
  { time: '08:30', title: 'Balade matinale', detail: 'Nala', icon: Heart, tone: 'var(--event-balade)' },
  { time: '14:00', title: 'Rendez-vous vétérinaire', detail: 'Oscar', icon: Stethoscope, tone: 'var(--event-rdv)' },
  { time: '19:00', title: 'Traitement du soir', detail: 'Nala', icon: Check, tone: 'var(--event-soins)' },
] as const

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
            Leur quotidien,
            <span className="mt-1 block font-normal italic text-primary">orchestré avec soin.</span>
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
          <div className="relative min-h-[560px] sm:min-h-[610px]">
            <section className="absolute inset-x-0 top-5 overflow-hidden rounded-[32px] border bg-card/95 p-4 shadow-[0_32px_90px_-38px_color-mix(in_srgb,var(--primary)_45%,transparent)] backdrop-blur sm:left-0 sm:right-16 sm:p-6" aria-labelledby="product-preview-title">
              <div className="flex items-start justify-between gap-4 border-b pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Mercredi 10 septembre</p>
                  <h2 id="product-preview-title" className="mt-1 text-2xl font-semibold tracking-tight">Une journée bien entourée</h2>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-primary"><CalendarDays aria-hidden="true" className="size-5" /></span>
              </div>
              <ol className="mt-4 grid gap-3">
                {dayEvents.map(({ time, title, detail, icon: Icon, tone }) => (
                  <li key={`${time}-${title}`} className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-3 overflow-hidden rounded-[20px] border bg-background p-3.5 shadow-xs transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-surface motion-reduce:transition-none sm:gap-4 sm:p-4">
                    <span aria-hidden="true" className="absolute inset-y-3 left-0 w-1 rounded-r-full" style={{ backgroundColor: tone }} />
                    <time className="pl-1 text-xs font-semibold text-muted-foreground sm:text-sm">{time}</time>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold sm:text-base">{title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{detail}</span>
                    </span>
                    <span className="grid size-9 place-items-center rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${tone} 18%, transparent)` }}><Icon aria-hidden="true" className="size-4" /></span>
                  </li>
                ))}
              </ol>
              <div className="mt-5 grid grid-cols-3 gap-2 rounded-[20px] bg-muted/70 p-2 text-center">
                <span className="rounded-control bg-card px-2 py-3"><strong className="block text-lg">3</strong><span className="text-[11px] text-muted-foreground">moments</span></span>
                <span className="px-2 py-3"><strong className="block text-lg">2</strong><span className="text-[11px] text-muted-foreground">animaux</span></span>
                <span className="px-2 py-3"><strong className="block text-lg">1</strong><span className="text-[11px] text-muted-foreground">équipe</span></span>
              </div>
            </section>

            <aside className="absolute -right-1 top-[330px] w-[210px] rounded-[24px] border bg-card p-4 shadow-overlay sm:right-0 sm:top-24 sm:w-[225px]" aria-label="Météo locale">
              <div className="flex items-center justify-between"><span className="text-xs font-semibold text-muted-foreground">Votre météo</span><CloudSun aria-hidden="true" className="size-5 text-primary" /></div>
              <p className="mt-3 text-3xl font-semibold tracking-tight">18°</p>
              <p className="mt-1 text-xs text-muted-foreground">Éclaircies · une sortie se prépare</p>
            </aside>

            <aside className="absolute bottom-0 left-3 w-[280px] rounded-[24px] bg-primary p-5 text-primary-foreground shadow-overlay sm:left-auto sm:right-3 sm:w-[330px]" aria-label="Objectif en cours">
              <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-primary-foreground/15"><Target aria-hidden="true" className="size-5" /></span><div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">Objectif en cours</p><p className="font-semibold">Reprise en douceur</p></div></div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-primary-foreground/20"><div className="h-full w-[68%] rounded-full bg-primary-foreground" /></div>
              <div className="mt-2 flex justify-between text-xs opacity-75"><span>4 étapes sur 6</span><span>68 %</span></div>
            </aside>
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
