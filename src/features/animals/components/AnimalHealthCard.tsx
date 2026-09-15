import { useState } from 'react'
import { Download, FileText, HeartPulse } from 'lucide-react'
import { toast } from 'sonner'

import { getEventDocumentUrl } from '@/features/events/api/events-api'
import { EventList } from '@/features/events/components/EventList'
import type { Event } from '@/features/events/types/event'
import { PremiumNotice, usePremiumGate } from '@/shared/components/feedback/PremiumGate'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { openPresignedUrl } from '@/shared/security/presigned-url'
import { getAnimalMedicalDocuments } from '../utils/animal-medical'

interface AnimalHealthCardProps {
  isLoading: boolean
  events: Event[]
  animalId: number
  isPremium: boolean
  canExport: boolean
}

const filters = [{ label: 'Tous', value: 'all' }, { label: 'Soins', value: 'soins' }, { label: 'Rendez-vous', value: 'rdv' }] as const

export function AnimalHealthCard({ isLoading, events, animalId, isPremium, canExport }: AnimalHealthCardProps) {
  const [filter, setFilter] = useState<'all' | 'soins' | 'rdv'>('all')
  const { handlePremiumError } = usePremiumGate()
  const documents = getAnimalMedicalDocuments(events)
  const filteredEvents = events.filter((event) => filter === 'all' || event.eventtype === filter)

  return <Card className="h-full gap-0 overflow-hidden rounded-[24px] p-0 shadow-surface">
    <header className="border-b bg-muted/20 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-[14px] bg-primary/10 text-primary"><HeartPulse className="size-5" aria-hidden="true" /></span><div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">Santé</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">Carnet de santé</h2><p className="mt-1 text-xs text-muted-foreground">{events.length} événement{events.length > 1 ? 's' : ''} médical{events.length > 1 ? 'aux' : ''}</p></div></div>
        {canExport && isPremium && <a className="inline-flex min-h-10 items-center gap-2 rounded-control border bg-card px-3 text-xs font-semibold hover:bg-muted" href={`/api/animals/${animalId}/medical-record`} download><Download className="size-4" aria-hidden="true" />Synthèse PDF</a>}
      </div>
      <div className="mt-4 flex gap-1 rounded-[14px] bg-muted/60 p-1" role="group" aria-label="Filtrer le carnet de santé">{filters.map((candidate) => <button key={candidate.value} type="button" aria-pressed={filter === candidate.value} onClick={() => setFilter(candidate.value)} className={`min-h-9 flex-1 rounded-[11px] px-3 text-xs font-semibold transition-colors ${filter === candidate.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{candidate.label}</button>)}</div>
    </header>
    <div className="p-5">
      {!isPremium && <PremiumNotice feature="medicalDocuments" className="mb-5" />}
      {isLoading ? <Skeleton className="h-48 w-full rounded-[18px]" /> : filteredEvents.length ? <EventList events={filteredEvents} /> : <div className="grid min-h-40 place-items-center rounded-[18px] border border-dashed text-center"><div><HeartPulse className="mx-auto size-6 text-muted-foreground" aria-hidden="true" /><p className="mt-2 text-sm font-semibold">Aucun élément dans cette vue</p><p className="mt-1 text-xs text-muted-foreground">Les prochains soins et rendez-vous apparaîtront ici.</p></div></div>}
      <section className="mt-6 border-t pt-5"><div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="font-semibold">Documents médicaux</h3><p className="mt-0.5 text-xs text-muted-foreground">Ordonnances, comptes rendus et résultats.</p></div><span className="rounded-full bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">{documents.length}</span></div>
        {!isPremium ? <p className="text-sm text-muted-foreground">Les pièces jointes restent visibles après activation de Premium.</p> : documents.length ? <ul className="space-y-2">{documents.map((document) => <li key={`${document.eventId}-${document.name}`} className="flex items-center gap-3 rounded-[16px] border bg-muted/25 p-3"><span className="grid size-9 shrink-0 place-items-center rounded-[12px] bg-card text-primary shadow-sm"><FileText className="size-4" aria-hidden="true" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{document.eventName}</strong><span className="text-[11px] text-muted-foreground">{new Date(`${document.eventDate}T12:00:00`).toLocaleDateString('fr-FR')}</span></span><Button type="button" size="sm" variant="ghost" onClick={async () => { try { openPresignedUrl(await getEventDocumentUrl(document.eventId, document.name)) } catch (error) { if (!await handlePremiumError(error, 'medicalDocuments')) toast.error(error instanceof Error ? error.message : 'Impossible d’ouvrir ce document.') } }}>Ouvrir</Button></li>)}</ul> : <p className="text-sm text-muted-foreground">Aucun document médical.</p>}
      </section>
    </div>
  </Card>
}
