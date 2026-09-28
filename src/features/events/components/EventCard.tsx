import { useState } from 'react'

import { AnimalAvatar } from '@/features/animals/components/AnimalAvatar'
import type { Animal } from '@/features/animals/types/animal'
import type { Event, MappedEvent } from '@/features/events/types/event'
import { eventToneClasses, hasCompletedState } from '@/features/events/utils/events'
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
import { Icon } from '@/shared/components/ui/icons'

interface EventCardProps {
  event: MappedEvent
  animals: Animal[]
  onEdit: () => void
  onDelete: () => void
  onComplete: (id: number, event: Event) => void
  onOpenDrawer: (event: MappedEvent) => void
  onDuplicate: () => void
  onUpdateAnimalImage: (id: number, imageObj: ImageSigned) => void
  strikeCompleted?: boolean
}

function formatEventDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).replace('.', '')
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
  strikeCompleted = false,
}: EventCardProps) => {
  const [completed, setCompleted] = useState(hasCompletedState(event))
  const toneClass = eventToneClasses[event.eventtype] ?? eventToneClasses.autre

  function handleComplete() {
    const newStatus = !completed
    setCompleted(newStatus)
    onComplete(event.id, { ...event, state: newStatus ? 'Terminé' : 'En cours' })
  }

  return (
    <Card
      className={`event-card-surface group relative flex min-h-28 flex-row items-stretch gap-0 overflow-hidden border-border/75 p-0 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-surface motion-reduce:transform-none ${toneClass}`}
      aria-label={`Carte d’événement ${event.nom}`}
    >
      <span aria-hidden="true" className="event-card-accent my-4 w-1.5 shrink-0 self-stretch rounded-r-full" />
      <button
        type="button"
        aria-label={`Ouvrir ${event.nom}`}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-control py-3 pl-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-4 sm:pl-4"
        onClick={() => onOpenDrawer(event)}
      >
        <span className="w-16 shrink-0 text-left">
          <span className="block text-sm font-semibold capitalize leading-5 text-foreground">{formatEventDate(event.dateevent)}</span>
          {event.heuredebutevent && <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><Icon name="time" className="size-3" />{event.heuredebutevent}</span>}
        </span>
        <span className="min-w-0 flex-1 space-y-1">
          <span className="flex items-center gap-1.5">
            <Icon name={event.icon} className="event-card-label size-4" />
            <span className="event-card-label truncate text-xs font-bold uppercase tracking-[0.06em]">{event.titleType}</span>
          </span>
          <span className={`block truncate text-sm font-semibold leading-5 sm:text-base ${completed && strikeCompleted ? 'line-through' : ''}`}>{event.nom}</span>
          {event.delay !== undefined ? (
            <span className="block truncate text-xs font-medium text-destructive">{event.delay} jour{event.delay > 1 ? 's' : ''} de retard</span>
          ) : event.lieu ? (
            <span className="flex items-center gap-1 truncate text-xs text-muted-foreground"><Icon name="pin" className="size-3" /><span className="truncate">{event.lieu}</span></span>
          ) : null}
          {animals.length > 0 && (
            <span className={`flex items-center pt-0.5 ${animals.length === 1 ? 'gap-1.5' : '-space-x-1.5'}`} aria-label="Animaux associés">
              {animals.length === 1 ? (
                <>
                  <AnimalAvatar animal={animals[0]} onUpdateAnimalImage={onUpdateAnimalImage} width={24} height={24} classNames="size-6 rounded-full border-2 border-card" />
                  <span className="max-w-32 truncate text-xs font-medium text-muted-foreground">{animals[0].nom || 'Animal'}</span>
                </>
              ) : (
                <>
                  {animals.slice(0, 3).map((animal) => (
                    <AnimalAvatar key={animal.id} animal={animal} onUpdateAnimalImage={onUpdateAnimalImage} width={24} height={24} classNames="size-6 rounded-full border-2 border-card" />
                  ))}
                  {animals.length > 3 && <span className="grid size-6 place-items-center rounded-full border-2 border-card bg-muted text-[9px] font-semibold">+{animals.length - 3}</span>}
                </>
              )}
            </span>
          )}
        </span>
      </button>
      <div className="flex shrink-0 flex-col items-center justify-between gap-1 py-2 pr-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild><IconButton size="compact" label={`Options pour l’événement ${event.nom}`}><Icon name="moreHorizontal" className="size-4" /></IconButton></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Modifier</DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>Dupliquer</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>Supprimer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <CustomCheckbox checked={completed} onChange={(changeEvent) => { changeEvent.stopPropagation(); handleComplete() }} label={completed ? `Marquer ${event.nom} comme à faire` : `Marquer ${event.nom} comme terminé`} />
      </div>
    </Card>
  )
}
