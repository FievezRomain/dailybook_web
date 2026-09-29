import { useMemo, useState } from 'react'
import { Download, FileText, HeartPulse } from 'lucide-react'
import { toast } from 'sonner'

import { getEventDocumentUrl } from '@/features/events/api/events-api'
import { EventList } from '@/features/events/components/EventList'
import type { Event } from '@/features/events/types/event'
import { MediaViewer } from '@/shared/components/feedback/MediaViewer'
import { PremiumNotice, usePremiumGate } from '@/shared/components/feedback/PremiumGate'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { SearchField } from '@/shared/components/ui/search-field'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { getAnimalMedicalDocuments } from '../utils/animal-medical'

interface AnimalHealthCardProps {
  isLoading: boolean
  events: Event[]
  animalId: number
  isPremium: boolean
  canExport: boolean
}

const filters = [{ label: 'Tous', value: 'all' }, { label: 'Soins', value: 'soins' }, { label: 'Rendez-vous', value: 'rdv' }] as const
const eventsPerPage = 6

function normalizeSearchValue(value: string | undefined) {
  return (value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr-FR')
}

function matchesMedicalEventSearch(event: Event, query: string) {
  if (!query) return true
  const typeLabel = event.eventtype === 'soins' ? 'soin soins' : event.eventtype === 'rdv' ? 'rendez-vous rendez vous rdv' : event.eventtype
  return normalizeSearchValue([
    event.nom,
    typeLabel,
    event.dateevent,
    event.lieu,
    event.specialiste,
    event.traitement,
    event.commentaire,
  ].filter(Boolean).join(' ')).includes(query)
}

export function AnimalHealthCard({ isLoading, events, animalId, isPremium, canExport }: AnimalHealthCardProps) {
  const [filter, setFilter] = useState<'all' | 'soins' | 'rdv'>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<{ name: string; url: string } | null>(null)
  const { handlePremiumError } = usePremiumGate()
  const documents = getAnimalMedicalDocuments(events)
  const normalizedSearch = normalizeSearchValue(search.trim())
  const filteredEvents = useMemo(
    () => events.filter((event) => (filter === 'all' || event.eventtype === filter) && matchesMedicalEventSearch(event, normalizedSearch)),
    [events, filter, normalizedSearch],
  )
  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / eventsPerPage))
  const currentPage = Math.min(page, pageCount)
  const visibleEvents = filteredEvents.slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage)

  function updateFilter(value: 'all' | 'soins' | 'rdv') {
    setFilter(value)
    setPage(1)
  }

  function updateSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  async function downloadMedicalRecord() {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/animals/${animalId}/medical-record`)
      if (!response.ok) throw new Error('La synthèse PDF est indisponible.')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `synthese-dossier-medical-${animalId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de télécharger la synthèse PDF.')
    } finally {
      setIsDownloading(false)
    }
  }

  async function openMedicalDocument(eventId: number, name: string) {
    try {
      const url = await getEventDocumentUrl(eventId, name)
      setSelectedDocument({ name, url })
    } catch (error) {
      if (!await handlePremiumError(error, 'medicalDocuments'))
        toast.error(error instanceof Error ? error.message : 'Impossible d’ouvrir ce document.')
    }
  }

  return <><Card className="h-full gap-0 overflow-hidden rounded-[24px] p-0 shadow-surface">
    <header className="border-b bg-muted/20 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">Santé</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">Carnet de santé</h2><p className="mt-1 text-xs text-muted-foreground">{events.length} {events.length === 1 ? 'événement médical' : 'événements médicaux'}</p></div>
        {canExport && isPremium && <Button type="button" variant="outline" size="sm" loading={isDownloading} onClick={() => void downloadMedicalRecord()}><Download className="size-4" aria-hidden="true" />Synthèse PDF</Button>}
      </div>
      <div className="mt-4 flex gap-1 rounded-[14px] bg-muted/60 p-1" role="group" aria-label="Filtrer le carnet de santé">{filters.map((candidate) => <button key={candidate.value} type="button" aria-pressed={filter === candidate.value} onClick={() => updateFilter(candidate.value)} className={`min-h-9 flex-1 rounded-[11px] px-3 text-xs font-semibold transition-colors ${filter === candidate.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{candidate.label}</button>)}</div>
    </header>
    <div className="p-5">
      {!isPremium && <PremiumNotice feature="medicalDocuments" className="mb-5" />}
      {!isLoading && events.length > eventsPerPage ? <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchField label="Rechercher dans le carnet de santé" placeholder="Rechercher un soin, un lieu, un spécialiste…" value={search} onChange={(event) => updateSearch(event.target.value)} onClear={() => updateSearch('')} containerClassName="max-w-none sm:max-w-md" />
        <span className="shrink-0 text-xs text-muted-foreground" aria-live="polite">{filteredEvents.length} {filteredEvents.length === 1 ? 'résultat' : 'résultats'}</span>
      </div> : null}
      {isLoading ? <Skeleton className="h-48 w-full rounded-[18px]" /> : visibleEvents.length ? <>
        <EventList events={visibleEvents} />
        {pageCount > 1 ? <nav className="mt-5 flex items-center justify-between gap-3 border-t pt-4" aria-label="Pagination du carnet de santé">
          <Button type="button" variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Précédent</Button>
          <span className="text-xs font-medium text-muted-foreground">Page {currentPage} sur {pageCount}</span>
          <Button type="button" variant="outline" size="sm" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Suivant</Button>
        </nav> : null}
      </> : isPremium ? <div className="grid min-h-40 place-items-center rounded-[18px] border border-dashed text-center"><div><HeartPulse className="mx-auto size-6 text-muted-foreground" aria-hidden="true" /><p className="mt-2 text-sm font-semibold">{search ? 'Aucun résultat' : 'Aucun élément dans cette vue'}</p><p className="mt-1 text-xs text-muted-foreground">{search ? 'Essayez un autre nom, lieu ou spécialiste.' : 'Les prochains soins et rendez-vous apparaîtront ici.'}</p></div></div> : null}
      {isPremium ? <section className="mt-6 border-t pt-5"><div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="font-semibold">Documents médicaux</h3><p className="mt-0.5 text-xs text-muted-foreground">Ordonnances, comptes rendus et résultats.</p></div><span className="rounded-full bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">{documents.length}</span></div>
        {documents.length ? <ul className="space-y-2">{documents.map((document) => <li key={`${document.eventId}-${document.name}`} className="flex items-center gap-3 rounded-[16px] border bg-muted/25 p-3"><span className="grid size-9 shrink-0 place-items-center rounded-[12px] bg-card text-primary shadow-sm"><FileText className="size-4" aria-hidden="true" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{document.eventName}</strong><span className="text-[11px] text-muted-foreground">{new Date(`${document.eventDate}T12:00:00`).toLocaleDateString('fr-FR')}</span></span><Button type="button" size="sm" variant="ghost" onClick={() => void openMedicalDocument(document.eventId, document.name)}>Ouvrir</Button></li>)}</ul> : <p className="text-sm text-muted-foreground">Aucun document médical.</p>}
      </section> : null}
    </div>
  </Card><MediaViewer open={selectedDocument !== null} fileName={selectedDocument?.name ?? ''} url={selectedDocument?.url ?? null} onOpenChange={(open) => { if (!open) setSelectedDocument(null) }} /></>
}
