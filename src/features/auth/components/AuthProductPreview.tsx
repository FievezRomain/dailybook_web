import { CalendarDays, CloudSun, MapPin, Target } from 'lucide-react'

import { Progress } from '@/shared/components/ui/progress'

const previewEvents = [
  {
    date: '10 sept.',
    time: '08:30',
    type: 'Balade',
    title: 'Balade matinale',
    location: 'Forêt de proximité',
    animal: 'Nala',
    tone: 'event-tone-balade',
  },
  {
    date: '10 sept.',
    time: '14:00',
    type: 'Rendez-vous médical',
    title: 'Visite vétérinaire',
    location: 'Clinique vétérinaire',
    animal: 'Oscar',
    tone: 'event-tone-rdv',
  },
] as const

function PreviewEventCard({ event }: { event: (typeof previewEvents)[number] }) {
  return (
    <article className={`event-card-surface ${event.tone} relative flex min-h-28 items-stretch overflow-hidden rounded-[20px] border border-border/75 bg-card p-0 text-foreground shadow-sm`}>
      <span aria-hidden="true" className="event-card-accent my-4 w-1.5 shrink-0 self-stretch rounded-r-full" />
      <div className="flex min-w-0 flex-1 items-center gap-3 py-3 pl-3 sm:gap-4 sm:pl-4">
        <time className="w-16 shrink-0 text-left">
          <span className="block text-sm font-semibold capitalize leading-5">{event.date}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">{event.time}</span>
        </time>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="event-card-label truncate text-xs font-bold uppercase tracking-[0.06em]">{event.type}</p>
          <p className="truncate text-sm font-semibold leading-5 sm:text-base">{event.title}</p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground"><MapPin aria-hidden="true" className="size-3" /><span className="truncate">{event.location}</span></p>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span aria-hidden="true" className="grid size-6 place-items-center rounded-full border-2 border-card bg-palomino text-[10px] font-bold text-bai-brun">{event.animal.charAt(0)}</span>
            <span className="truncate text-xs font-medium text-muted-foreground">{event.animal}</span>
          </div>
        </div>
        <span aria-hidden="true" className="mr-3 size-5 shrink-0 rounded-[6px] border-2 border-primary bg-card" />
      </div>
    </article>
  )
}

function PreviewObjectiveCard() {
  return (
    <article className="relative overflow-hidden rounded-[24px] border border-border/70 bg-card text-foreground shadow-sm">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-bai-cerise to-alezan" />
      <header className="flex items-start gap-3 px-4 pb-3 pt-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-primary/10 text-primary"><Target aria-hidden="true" className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">En progression</span>
          <h3 className="mt-2 truncate text-base font-semibold tracking-[-0.02em]">Reprise en douceur</h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays aria-hidden="true" className="size-3.5" />10 sept. — 30 sept.</p>
        </div>
      </header>
      <div className="mx-4 rounded-[16px] bg-muted/40 p-3">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Progression</p><p className="mt-0.5 text-xs text-muted-foreground">4 étapes sur 6</p></div>
          <strong className="text-xl tracking-[-0.04em] text-primary">68%</strong>
        </div>
        <Progress value={68} className="h-2" aria-label="Progression de l’objectif : 68 pour cent" />
      </div>
      <footer className="mt-3 flex min-h-12 items-center justify-between gap-3 border-t border-border/60 px-4 py-2.5">
        <div className="flex items-center gap-2"><span aria-hidden="true" className="grid size-7 place-items-center rounded-full border-2 border-card bg-palomino text-[10px] font-bold text-bai-brun">N</span><span className="text-xs font-medium text-muted-foreground">Nala</span></div>
        <span className="text-xs font-medium text-muted-foreground">6 étapes</span>
      </footer>
    </article>
  )
}

function PreviewWeatherCard() {
  return (
    <aside className="rounded-[22px] bg-card p-4 text-foreground shadow-surface" aria-label="Météo locale">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-[14px] bg-palomino/60 text-primary"><CloudSun aria-hidden="true" className="size-5" /></span>
        <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-muted-foreground">Votre position actuelle</p><p className="text-sm font-semibold">Éclaircies</p></div>
        <strong className="text-2xl font-semibold tracking-tight">18 °C</strong>
      </div>
      <div className="mt-3 flex gap-4 border-t border-border/60 pt-3 text-[11px] text-muted-foreground"><span>Humidité 64 %</span><span>Vent 3 m/s</span></div>
    </aside>
  )
}

export function AuthProductPreview({ compact = false, showWeather = false }: { compact?: boolean; showWeather?: boolean }) {
  return (
    <section className={compact ? 'grid gap-2.5' : 'grid gap-3'} aria-label="Aperçu de Vasco">
      <div className="flex items-center justify-between gap-4 px-1">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Aujourd’hui</p><p className="mt-1 text-sm font-semibold text-foreground">Deux événements à venir</p></div>
        <CalendarDays aria-hidden="true" className="size-5 text-primary" />
      </div>
      <div className={compact ? 'grid gap-2' : 'grid gap-3'}>
        {previewEvents.map((event) => <PreviewEventCard key={`${event.time}-${event.title}`} event={event} />)}
      </div>
      <div className={showWeather ? 'grid gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(260px,1.1fr)]' : ''}>
        {showWeather && <PreviewWeatherCard />}
        <PreviewObjectiveCard />
      </div>
    </section>
  )
}
