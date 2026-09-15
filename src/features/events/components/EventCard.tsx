import { useState } from 'react'
import { CalendarDays, Clock3, MapPin, MoreHorizontal } from 'lucide-react'

import { AnimalAvatar } from '@/features/animals/components/AnimalAvatar'
import type { Animal } from '@/features/animals/types/animal'
import type { Event, MappedEvent } from '@/features/events/types/event'
import { eventToneClasses } from '@/features/events/utils/events'
import { CustomCheckbox } from '@/shared/components/forms/CustomCheckbox'
import { IconButton } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import type { ImageSigned } from '@/types/image'

interface EventCardProps {
  event: MappedEvent
  animals: Animal[]
  onEdit: () => void
  onDelete: () => void
  onComplete: (id: number, event: Event) => void
  onOpenDrawer: (event: MappedEvent) => void
  onDuplicate: () => void
  onUpdateAnimalImage: (id: number, imageObj: ImageSigned) => void
}

function formatEventDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export const EventCard = ({
  event,
  animals,
  onEdit,
  onDelete,
  onComplete,
  onOpenDrawer,
  onDuplicate,
  onUpdateAnimalImage,
}: EventCardProps) => {
  const [completed, setCompleted] = useState(event.state === 'Terminé')
  const Icon = event.icon
  const toneClass = eventToneClasses[event.eventtype] ?? eventToneClasses.autre

  function handleComplete() {
    const newStatus = !completed
    setCompleted(newStatus)
    onComplete(event.id, { ...event, state: newStatus ? 'Terminé' : 'En cours' })
  }

  return (
    <Card
      className={`event-card-surface group relative gap-0 overflow-hidden border-border/75 p-0 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-surface motion-reduce:transform-none ${toneClass}`}
      aria-label={`Carte d’événement ${event.nom}`}
    >
      <span aria-hidden="true" className="event-card-accent absolute inset-x-4 top-0 h-1 rounded-b-full" />
      <div className="flex items-center gap-3 px-4 pb-2 pt-4">
        <span className="event-card-icon grid size-9 shrink-0 place-items-center rounded-full">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="event-card-label min-w-0 flex-1 truncate text-xs font-bold uppercase tracking-[0.08em]">{event.titleType}</span>
        {animals.length > 0 && (
          <div className="hidden -space-x-2 sm:flex" aria-label="Animaux associés">
            {animals.slice(0, 3).map((animal) => (
              <AnimalAvatar key={animal.id} animal={animal} onUpdateAnimalImage={onUpdateAnimalImage} width={28} height={28} classNames="rounded-full border-2 border-card" />
            ))}
            {animals.length > 3 && <span className="grid size-7 place-items-center rounded-full border-2 border-card bg-muted text-[9px] font-semibold">+{animals.length - 3}</span>}
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild><IconButton size="compact" label={`Options pour l’événement ${event.nom}`}><MoreHorizontal aria-hidden="true" /></IconButton></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Modifier</DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>Dupliquer</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>Supprimer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-start gap-2 px-3 pb-4">
        <CustomCheckbox checked={completed} onChange={(changeEvent) => { changeEvent.stopPropagation(); handleComplete() }} label={completed ? `Marquer ${event.nom} comme à faire` : `Marquer ${event.nom} comme terminé`} />
        <button type="button" className="min-w-0 flex-1 cursor-pointer rounded-control pr-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => onOpenDrawer(event)}>
          <span className={`block truncate text-base font-semibold leading-snug sm:text-lg ${completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{event.nom}</span>
          <span className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span className="event-card-chip inline-flex items-center gap-1 rounded-full px-2 py-1 capitalize"><CalendarDays className="size-3.5" aria-hidden="true" />{formatEventDate(event.dateevent)}</span>
            {event.heuredebutevent && <span className="event-card-chip inline-flex items-center gap-1 rounded-full px-2 py-1"><Clock3 className="size-3.5" aria-hidden="true" />{event.heuredebutevent}</span>}
            {event.lieu && <span className="event-card-chip inline-flex max-w-48 items-center gap-1 truncate rounded-full px-2 py-1"><MapPin className="size-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{event.lieu}</span></span>}
          </span>
        </button>
      </div>

      {event.delay !== undefined && (
        <p className="border-t border-destructive/10 bg-destructive/5 px-4 py-1.5 text-right text-xs font-medium text-destructive">{event.delay} jour{event.delay > 1 ? 's' : ''} de retard</p>
      )}
    </Card>
  )
}
