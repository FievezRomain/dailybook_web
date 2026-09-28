import { useState, type ComponentType, type ReactNode } from 'react'
import {
  CalendarDays,
  Clock3,
  FileText,
  MapPin,
  MessageSquareText,
  PawPrint,
  Pencil,
  Repeat2,
  Share2,
  Trash2,
  UserRound,
  WalletCards,
} from 'lucide-react'

import { AnimalAvatar } from '@/features/animals/components/AnimalAvatar'
import type { Animal } from '@/features/animals/types/animal'
import { getEventDocumentUrl } from '@/features/events/api/events-api'
import type { MappedEvent } from '@/features/events/types/event'
import { eventToneClasses, formatWalkDuration } from '@/features/events/utils/events'
import { MediaViewer } from '@/shared/components/feedback/MediaViewer'
import { Button } from '@/shared/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { RatingStars } from '@/shared/components/ui/rating-stars'
import type { ImageSigned } from '@/types/image'
import { Icon, type IconName } from '@/shared/components/ui/icons'

type EventDrawerProps = {
  open: boolean
  onClose: () => void
  event: MappedEvent
  animals: Animal[] | undefined
  onEdit: () => void
  onDelete: () => void
  onUpdateAnimalImage: (id: number, imageObj: ImageSigned) => void
}

type Detail = { icon: ComponentType<{ className?: string }>; label: string; value: ReactNode }

function eventDate(value: string) {
  return new Date(`${value}T12:00:00`)
}

function formatDate(value: string) {
  return eventDate(value).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatRecurrence(value?: string) {
  return ({
    daily: 'Tous les jours', tlj: 'Tous les jours', weekly: 'Toutes les semaines', tls: 'Toutes les semaines',
    biweekly: 'Toutes les deux semaines', tl2s: 'Toutes les deux semaines', monthly: 'Tous les mois', tlm: 'Tous les mois',
    yearly: 'Tous les ans', annual: 'Tous les ans', annee: 'Tous les ans',
  } as Record<string, string>)[value ?? ''] ?? 'Série récurrente'
}

function normalizeTechnicalValue(value: string) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('fr-FR')
}

function formatEventState(value?: string) {
  const normalized = normalizeTechnicalValue(value ?? '')
  if (['completed', 'done', 'termine', 'terminee', 'true'].includes(normalized)) return 'Terminé'
  if (['pending', 'todo', 'a faire', 'false'].includes(normalized)) return 'À faire'
  if (['in_progress', 'in progress', 'en cours'].includes(normalized)) return 'En cours'
  return value?.trim() || 'À faire'
}

function formatReminder(value: string) {
  return ({
    '30m': '30 minutes avant',
    '1h': '1 heure avant',
    '1d': '1 jour avant',
    annee: 'Dans un an',
    annual: 'Dans un an',
    yearly: 'Dans un an',
  } as Record<string, string>)[normalizeTechnicalValue(value)] ?? value
}

function formatExpenseCategory(value?: string) {
  return ({
    alimentation: 'Alimentation',
    equipement: 'Équipement',
    accessoire: 'Accessoire',
    garde: 'Garde',
    formation: 'Formation',
    assurance: 'Assurance',
    balade: 'Balade',
    entrainement: 'Entraînement',
    concours: 'Concours',
    rdv: 'Rendez-vous',
    soins: 'Soins',
    autre: 'Autre',
  } as Record<string, string>)[normalizeTechnicalValue(value ?? '')] ?? 'Dépense'
}

function currentTimestamp() {
  return Date.now()
}

function SectionTitle({ icon: LegacyIcon, iconName, children, id }: { icon?: ComponentType<{ className?: string }>; iconName?: IconName; children: ReactNode; id: string }) {
  return <h3 id={id} className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">{iconName ? <Icon name={iconName} className="size-4 text-[var(--event-color)]" /> : LegacyIcon ? <LegacyIcon aria-hidden="true" className="size-4 text-[var(--event-color)]" /> : null}{children}</h3>
}

function DetailRow({ detail }: { detail: Detail }) {
  const Icon = detail.icon
  return (
    <div className="grid grid-cols-[28px_minmax(0,1fr)] gap-2.5 py-3">
      <span className="event-card-icon grid size-7 place-items-center rounded-full"><Icon aria-hidden="true" className="size-3.5" /></span>
      <div className="min-w-0"><dt className="text-xs text-muted-foreground">{detail.label}</dt><dd className="mt-0.5 text-sm font-semibold leading-5">{detail.value}</dd></div>
    </div>
  )
}

export const EventDrawer = ({ open, onClose, event, animals, onEdit, onDelete, onUpdateAnimalImage }: EventDrawerProps) => {
  const toneClass = eventToneClasses[event.eventtype] ?? eventToneClasses.autre
  const date = eventDate(event.dateevent)
  const [signedUrls, setSignedUrls] = useState<Record<string, { url: string; expiresAt: number }>>({})
  const [documentError, setDocumentError] = useState<string>()
  const [selectedDocument, setSelectedDocument] = useState<{ name: string; url: string } | null>(null)
  const walkDuration = event.eventtype === 'balade' ? formatWalkDuration(event) : undefined

  const detailRows: Detail[] = [
    ...(event.specialiste ? [{ icon: UserRound, label: 'Spécialiste', value: event.specialiste }] : []),
    ...(event.depense !== undefined ? [{ icon: WalletCards, label: formatExpenseCategory(event.categoriedepense), value: `${event.depense.toLocaleString('fr-FR')} €` }] : []),
    ...(event.frequencetype || event.idparent ? [{ icon: Repeat2, label: 'Répétition', value: formatRecurrence(event.frequencevalue) }] : []),
  ]

  const contextualDetails = [
    event.discipline && ['Discipline', event.discipline],
    event.epreuve && ['Épreuve', event.epreuve],
    event.dossart && ['Dossard', event.dossart],
    event.placement && ['Classement', event.placement],
    event.note !== undefined && ['Note', String(event.note)],
    event.traitement && ['Traitement', event.traitement],
    event.datefinsoins && ['Fin des soins', formatDate(event.datefinsoins)],
    event.heuredebutbalade && ['Début de la balade', event.heuredebutbalade],
    event.datefinbalade && ['Fin de la balade', formatDate(event.datefinbalade)],
    event.heurefinbalade && ['Heure de fin', event.heurefinbalade],
    walkDuration && ['Durée de la balade', walkDuration],
    event.rappelnotification && ['Rappel', formatReminder(event.rappelnotification)],
    event.made_by?.name && ['Réalisé par', event.made_by.name],
    event.created_by?.name && ['Créé par', event.created_by.name],
  ].filter(Boolean) as string[][]

  async function handleOpenFile(fileName: string) {
    setDocumentError(undefined)
    try {
      const cached = signedUrls[fileName]
      const now = currentTimestamp()
      if (cached && cached.expiresAt > now) {
        setSelectedDocument({ name: fileName, url: cached.url })
        return
      }
      const url = await getEventDocumentUrl(event.id, fileName)
      setSignedUrls((previous) => ({ ...previous, [fileName]: { url, expiresAt: now + 4.5 * 60 * 1000 } }))
      setSelectedDocument({ name: fileName, url })
    } catch {
      setDocumentError('Impossible d’ouvrir ce document. Vérifiez votre accès puis réessayez.')
    }
  }

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose() }}>
      <SheetContent side="right" width="wide" closeLabel="Fermer le détail" overlayClassName="bg-black/25 backdrop-blur-[1px]" className={`gap-0 overflow-hidden border-l border-border/70 bg-background p-0 ${toneClass}`}>
        <SheetHeader className="event-detail-sheet-header relative gap-0 border-b px-5 pb-5 pt-6 pr-16 text-left sm:px-7 sm:pb-6 sm:pt-7 sm:pr-16">
          <div className="mb-5 flex items-center gap-2">
            <span className="event-detail-type-icon grid size-10 place-items-center rounded-[14px]"><Icon name={event.icon} className="size-5" /></span>
            <span className="event-detail-type-badge rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.1em]">{event.titleType}</span>
            <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-xs font-semibold text-muted-foreground backdrop-blur-sm">{formatEventState(event.state)}</span>
          </div>
          <SheetTitle className="text-[clamp(1.65rem,4vw,2.25rem)] leading-[1.08] tracking-[-0.025em]">{event.nom}</SheetTitle>
          <SheetDescription className="sr-only">Informations de l’événement.</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <main className="space-y-7 px-5 py-6 sm:px-7">
            <section aria-labelledby="event-schedule-title">
              <SectionTitle id="event-schedule-title" icon={CalendarDays}>Quand et où</SectionTitle>
              <div className="mt-3 overflow-hidden rounded-[22px] border bg-card shadow-sm">
                <div className="grid grid-cols-[88px_minmax(0,1fr)] sm:grid-cols-[108px_minmax(0,1fr)]">
                  <div className="event-detail-date flex min-h-32 flex-col items-center justify-center px-3 text-center">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] opacity-75">{date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}</span>
                    <span className="mt-0.5 text-4xl font-bold leading-none">{date.getDate()}</span>
                    <span className="mt-1 text-xs font-semibold capitalize opacity-80">{date.toLocaleDateString('fr-FR', { weekday: 'long' })}</span>
                  </div>
                  <div className="flex min-w-0 flex-col justify-center gap-3 px-4 py-5 sm:px-5">
                    <p className="text-sm font-semibold capitalize">{formatDate(event.dateevent)}</p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2"><Clock3 aria-hidden="true" className="size-4 shrink-0 text-[var(--event-color)]" />{event.heuredebutevent || 'Toute la journée'}</p>
                      {event.lieu && <p className="flex items-start gap-2"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--event-color)]" /><span>{event.lieu}</span></p>}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section aria-labelledby="event-animals-title">
              <SectionTitle id="event-animals-title" icon={PawPrint}>Animaux concernés</SectionTitle>
              <div className="mt-3 flex flex-wrap gap-2">
                {animals === undefined ? [...Array(Math.max(event.animaux.length, 1))].map((_, index) => <Skeleton key={index} className="h-12 w-32 rounded-full" />) : animals.length > 0 ? animals.map((animal) => (
                  <div key={animal.id} className="flex items-center gap-2.5 rounded-full border bg-card py-1.5 pl-1.5 pr-4 shadow-sm">
                    <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-muted [&>*]:!h-full [&>*]:!w-full"><AnimalAvatar animal={animal} onUpdateAnimalImage={onUpdateAnimalImage} width={36} height={36} classNames="size-full rounded-full object-cover" /></span>
                    <span className="max-w-36 truncate text-sm font-semibold">{animal.nom || 'Animal'}</span>
                  </div>
                )) : <p className="text-sm text-muted-foreground">Aucun animal associé.</p>}
              </div>
            </section>

            {(detailRows.length > 0 || contextualDetails.length > 0) && <section aria-labelledby="event-details-title">
              <SectionTitle id="event-details-title" iconName={event.icon}>Détails</SectionTitle>
              <dl className="mt-3 divide-y rounded-[22px] border bg-card px-4 shadow-sm">
                {detailRows.map((detail) => <DetailRow key={detail.label} detail={detail} />)}
                {contextualDetails.map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(105px,0.7fr)_minmax(0,1fr)] gap-3 py-3.5 text-sm"><dt className="text-muted-foreground">{label}</dt><dd className="font-semibold leading-5">{label === 'Note' && event.note !== undefined ? <RatingStars value={event.note} activeClassName="fill-[var(--event-color)] text-[var(--event-color)]" /> : value}</dd></div>)}
              </dl>
            </section>}

            {event.commentaire && <section aria-labelledby="event-comment-title"><SectionTitle id="event-comment-title" icon={MessageSquareText}>Note</SectionTitle><blockquote className="event-detail-note mt-3 rounded-[22px] border-l-4 p-4 text-sm leading-6">{event.commentaire}</blockquote></section>}

            {event.documents.length > 0 && <section aria-labelledby="event-documents-title"><SectionTitle id="event-documents-title" icon={FileText}>Documents · {event.documents.length}</SectionTitle>{documentError && <p role="alert" className="mt-3 text-sm text-destructive">{documentError}</p>}<div className="mt-3 divide-y overflow-hidden rounded-[22px] border bg-card shadow-sm">{event.documents.map((document) => { const fileName = document.name.split('/').pop() ?? document.name; return <div key={document.name} className="flex min-w-0 items-center gap-3 p-3.5"><span className="event-card-icon grid size-9 shrink-0 place-items-center rounded-full"><FileText aria-hidden="true" className="size-4" /></span><span className="min-w-0 flex-1 truncate text-sm font-semibold">{fileName}</span><Button variant="outline" size="sm" onClick={() => void handleOpenFile(document.name)}>Ouvrir</Button></div> })}</div></section>}

            {event.shared_groups.length > 0 && <section aria-labelledby="event-sharing-title"><SectionTitle id="event-sharing-title" icon={Share2}>Partagé avec</SectionTitle><ul className="mt-3 flex flex-wrap gap-2">{event.shared_groups.map((group) => <li key={group.id} className="rounded-full border bg-card px-3.5 py-2 text-sm font-semibold shadow-sm">{group.name || `Groupe ${group.id}`}</li>)}</ul></section>}
          </main>
        </div>

        <footer className="flex shrink-0 items-center gap-2 border-t bg-background/95 px-5 py-4 backdrop-blur sm:px-7">
          <Button className="flex-1" onClick={onEdit}><Pencil aria-hidden="true" />Modifier l’événement</Button>
          <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={onDelete}><Trash2 aria-hidden="true" />Supprimer</Button>
        </footer>
      </SheetContent>
      <MediaViewer open={selectedDocument !== null} fileName={selectedDocument?.name ?? ''} url={selectedDocument?.url ?? null} onOpenChange={(nextOpen) => { if (!nextOpen) setSelectedDocument(null) }} />
    </Sheet>
  )
}
