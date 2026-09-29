import { ArrowLeft, CalendarDays, Check, CloudSun, Target } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const previewEvents = [
  ['08:30', 'Balade matinale', 'var(--event-balade)'],
  ['14:00', 'Rendez-vous vétérinaire', 'var(--event-rdv)'],
] as const

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex w-fit items-center gap-2.5 rounded-control outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
      <span className={`grid place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/10 transition-transform duration-300 group-hover:-rotate-3 motion-reduce:transition-none ${compact ? 'size-12' : 'size-14'}`}>
        <Image src="/logo.png" alt="" width={compact ? 42 : 48} height={compact ? 42 : 48} className="size-[86%] object-contain" priority />
      </span>
      <span className={`${compact ? 'text-base' : 'text-lg'} font-bold tracking-[0.12em]`}>VASCO</span>
    </Link>
  )
}

const editorialCopy = {
  login: {
    eyebrow: 'Votre quotidien, en confiance',
    title: <>Reprenez le fil.<br /><span className="font-normal italic opacity-75">Tout est déjà là.</span></>,
    description: 'Vos animaux, leurs soins et les personnes qui vous accompagnent vous attendent dans un espace clair et apaisé.',
    footer: 'Un espace partagé, une mémoire fiable, moins de charge mentale.',
  },
  register: {
    eyebrow: 'Un nouvel espace, à votre rythme',
    title: <>Commencez simplement.<br /><span className="font-normal italic opacity-75">Le reste suivra.</span></>,
    description: 'Créez votre espace Vasco, ajoutez vos animaux quand vous le souhaitez et invitez uniquement les personnes qui comptent.',
    footer: 'Quelques instants maintenant, beaucoup de clarté au quotidien.',
  },
} as const

export function AuthShell({ children, variant = 'login' }: { children: React.ReactNode; variant?: keyof typeof editorialCopy }) {
  const copy = editorialCopy[variant]
  return (
    <main className="min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-[minmax(480px,0.96fr)_minmax(520px,1.04fr)]">
      <aside className="relative m-4 hidden min-h-[calc(100dvh-2rem)] overflow-hidden rounded-[32px] bg-primary p-10 text-primary-foreground shadow-overlay lg:flex lg:flex-col xl:p-14" aria-label="L’univers Vasco">
        <div aria-hidden="true" className="absolute -right-28 -top-36 size-[430px] rounded-full border border-primary-foreground/10" />
        <div aria-hidden="true" className="absolute -right-12 -top-20 size-[280px] rounded-full border border-primary-foreground/10" />
        <div className="relative">
          <Brand />
        </div>

        <div className="relative my-auto py-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-65">{copy.eyebrow}</p>
          <h2 className="mt-4 max-w-xl text-[clamp(2.5rem,4vw,4.7rem)] font-semibold leading-[0.98] tracking-[-0.045em]">{copy.title}</h2>
          <p className="mt-5 max-w-lg text-sm leading-6 opacity-70 xl:text-base xl:leading-7">{copy.description}</p>

          <section className="relative mt-9 max-w-[520px] rounded-[26px] border border-primary-foreground/15 bg-primary-foreground/[0.08] p-4 backdrop-blur-sm" aria-label="Aperçu de votre journée">
            <div className="flex items-center justify-between gap-4 px-1 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-60">Aujourd’hui</p><p className="mt-1 font-semibold">Deux moments à venir</p></div><CalendarDays aria-hidden="true" className="size-5 opacity-70" /></div>
            <ol className="grid gap-2">
              {previewEvents.map(([time, title, tone]) => (
                <li key={time} className="relative flex items-center gap-3 overflow-hidden rounded-[16px] bg-background px-4 py-3 text-foreground shadow-sm">
                  <span aria-hidden="true" className="absolute inset-y-2 left-0 w-1 rounded-r-full" style={{ backgroundColor: tone }} />
                  <time className="text-xs font-semibold text-muted-foreground">{time}</time>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</span>
                  <span className="grid size-7 place-items-center rounded-full bg-muted"><Check aria-hidden="true" className="size-3.5 text-primary" /></span>
                </li>
              ))}
            </ol>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-[16px] bg-primary-foreground/10 p-3"><div className="flex items-center gap-2 text-xs font-semibold"><CloudSun aria-hidden="true" className="size-4" />Météo locale</div><p className="mt-1 text-[11px] opacity-60">18° · Éclaircies</p></div>
              <div className="rounded-[16px] bg-primary-foreground/10 p-3"><div className="flex items-center gap-2 text-xs font-semibold"><Target aria-hidden="true" className="size-4" />Objectif à 68 %</div><p className="mt-1 text-[11px] opacity-60">Reprise en douceur</p></div>
            </div>
          </section>
        </div>

        <p className="relative text-xs opacity-55">{copy.footer}</p>
      </aside>

      <section className="flex min-h-dvh min-w-0 flex-col">
        <header className="flex h-20 shrink-0 items-center justify-between px-5 sm:px-8 lg:px-12">
          <div className="lg:hidden"><Brand compact /></div>
          <Link href="/" className="ml-auto inline-flex items-center gap-2 rounded-control text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"><ArrowLeft aria-hidden="true" className="size-4" />Retour à l’accueil</Link>
        </header>
        <div className="flex flex-1 items-center justify-center px-5 pb-12 pt-5 sm:px-8 lg:px-12 lg:pb-20">
          {children}
        </div>
        <footer className="px-5 py-5 text-center text-[11px] text-muted-foreground sm:px-8 lg:px-12">{variant === 'login' ? 'Connexion sécurisée à votre espace Vasco' : 'Création sécurisée de votre espace Vasco'}</footer>
      </section>
    </main>
  )
}

export function AuthStatusShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-20 shrink-0 items-center px-5 sm:px-8 lg:px-12"><Brand /></header>
      <section className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">{children}</section>
    </main>
  )
}
