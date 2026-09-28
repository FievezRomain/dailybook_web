import { CalendarDays, MapPin } from 'lucide-react'

import { AnimalAvatar } from '@/features/animals/components/AnimalAvatar'
import type { Animal } from '@/features/animals/types/animal'
import type { Event } from '@/features/events/types/event'
import { eventToneClasses, iconsMap, titleMap } from '@/features/events/utils/events'
import { cn } from '@/lib/utils'
import { Card } from '@/shared/components/ui/card'
import { Icon } from '@/shared/components/ui/icons'
import { RatingStars } from '@/shared/components/ui/rating-stars'
import type { ImageSigned } from '@/types/image'

function activityDetail(event: Event) {
  if (event.eventtype === 'balade') {
    const times = [event.heuredebutbalade, event.heurefinbalade].filter(Boolean).join(' — ')
    return times || event.lieu
  }
  if (event.eventtype === 'entrainement') return event.discipline || event.lieu
  if (event.eventtype === 'concours') return event.epreuve || event.placement || event.lieu
  return event.lieu
}

export function ActivityEventCards({
  animals,
  events,
  onOpenEvent,
  onUpdateAnimalImage,
}: {
  animals: Animal[]
  events: Event[]
  onOpenEvent: (event: Event) => void
  onUpdateAnimalImage: (id: number, image: ImageSigned) => void
}) {
  return (
    <div className="grid gap-3 pt-4 lg:grid-cols-2">
      {events.map((event) => {
        const linkedAnimals = animals.filter((animal) => event.animaux.includes(animal.id))
        const tone = eventToneClasses[event.eventtype] ?? eventToneClasses.autre
        const detail = activityDetail(event)

        return (
          <Card
            key={event.id}
            className={cn('event-card-surface relative flex min-h-28 flex-row gap-0 overflow-hidden rounded-[20px] border-border/75 p-0 shadow-sm', tone)}
            aria-label={`Activité ${event.nom}`}
          >
            <span aria-hidden="true" className="event-card-accent my-4 w-1.5 shrink-0 rounded-r-full" />
            <button
              type="button"
              className="flex min-w-0 flex-1 cursor-pointer gap-3 rounded-control p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Ouvrir les détails de ${event.nom}`}
              onClick={() => onOpenEvent(event)}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-muted/60 event-card-label">
                <Icon name={iconsMap[event.eventtype] ?? 'tracking'} className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="event-card-label text-[10px] font-bold uppercase tracking-[0.08em]">{titleMap[event.eventtype] ?? 'Activité'}</p>
                <h3 className="mt-1 truncate text-sm font-semibold sm:text-base">{event.nom}</h3>
                <div className="mt-2">
                  {event.note !== undefined ? <RatingStars value={event.note} activeClassName="fill-[var(--event-color)] text-[var(--event-color)]" /> : <span className="text-xs text-muted-foreground">Non noté</span>}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" aria-hidden="true" />{new Date(`${event.dateevent}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  {detail && <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" aria-hidden="true" />{detail}</span>}
                </div>
                {linkedAnimals.length > 0 && (
                  <div className={cn('mt-3 flex items-center', linkedAnimals.length === 1 ? 'gap-2' : '-space-x-1.5')} aria-label="Animaux associés">
                    {linkedAnimals.length === 1 ? (
                      <>
                        <AnimalAvatar animal={linkedAnimals[0]} onUpdateAnimalImage={onUpdateAnimalImage} width={28} height={28} classNames="size-7 rounded-full border-2 border-card" />
                        <span className="max-w-40 truncate text-xs font-medium text-muted-foreground">{linkedAnimals[0].nom || 'Animal'}</span>
                      </>
                    ) : linkedAnimals.slice(0, 4).map((animal) => (
                      <AnimalAvatar key={animal.id} animal={animal} onUpdateAnimalImage={onUpdateAnimalImage} width={28} height={28} classNames="size-7 rounded-full border-2 border-card" />
                    ))}
                  </div>
                )}
              </div>
            </button>
          </Card>
        )
      })}
    </div>
  )
}
