import { CalendarDays, CircleDollarSign } from 'lucide-react'

import { AnimalAvatar } from '@/features/animals/components/AnimalAvatar'
import type { Animal } from '@/features/animals/types/animal'
import type { Event } from '@/features/events/types/event'
import { eventToneClasses, iconsMap, titleMap } from '@/features/events/utils/events'
import { cn } from '@/lib/utils'
import { Card } from '@/shared/components/ui/card'
import { Icon } from '@/shared/components/ui/icons'
import { SystemState } from '@/shared/components/ui/system-state'
import type { ImageSigned } from '@/types/image'

import type { EventStatistics } from '../types/statistics'

const expenseCategories: Record<string, string> = {
  accessoire: 'Accessoire',
  alimentation: 'Alimentation',
  assurance: 'Assurance',
  autre: 'Autre',
  equipement: 'Équipement',
  formation: 'Formation',
  garde: 'Garde',
  sante: 'Santé',
  transport: 'Transport',
}

function expenseEvents(result: EventStatistics) {
  const events = new Map<number, Event>()
  result.statistic.forEach((item) => item.events.forEach((event) => events.set(event.id, event)))
  return [...events.values()].sort((left, right) => right.dateevent.localeCompare(left.dateevent))
}

function formatExpense(value?: number) {
  return value === undefined
    ? 'Montant non renseigné'
    : `${value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`
}

function categoryLabel(value?: string) {
  if (!value) return 'Dépense'
  return expenseCategories[value.toLocaleLowerCase('fr-FR')] ?? value
}

export function ExpenseEventCards({
  animals,
  description = 'Chaque montant reste rattaché à l’événement qui l’a généré.',
  onUpdateAnimalImage,
  result,
  title = 'Dépenses de la période',
}: {
  animals: Animal[]
  description?: string
  onUpdateAnimalImage: (id: number, image: ImageSigned) => void
  result: EventStatistics
  title?: string
}) {
  const events = expenseEvents(result)

  return (
    <section aria-labelledby="expense-events-title" className="space-y-3">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">Événements associés</p>
        <h2 id="expense-events-title" className="mt-1 text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </header>

      {events.length === 0 ? (
        <Card className="rounded-[22px] shadow-none">
          <SystemState title="Aucun événement de dépense" description="Les événements correspondant aux filtres apparaîtront ici." />
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {events.map((event) => {
            const linkedAnimals = animals.filter((animal) => event.animaux.includes(animal.id))
            const tone = eventToneClasses[event.eventtype] ?? eventToneClasses.autre
            return (
              <Card
                key={event.id}
                className={cn('event-card-surface relative flex min-h-32 flex-row gap-0 overflow-hidden rounded-[22px] border-border/75 p-0 shadow-sm', tone)}
                aria-label={`Dépense ${event.nom}`}
              >
                <span aria-hidden="true" className="event-card-accent my-4 w-1.5 shrink-0 rounded-r-full" />
                <div className="flex min-w-0 flex-1 gap-3 p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-muted/60 event-card-label">
                    <Icon name={iconsMap[event.eventtype] ?? 'expense'} className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="event-card-label text-[10px] font-bold uppercase tracking-[0.08em]">{titleMap[event.eventtype] ?? 'Dépense'}</p>
                        <h3 className="mt-1 truncate text-sm font-semibold sm:text-base">{event.nom}</h3>
                      </div>
                      <strong className="shrink-0 text-lg font-semibold tabular-nums text-primary">{formatExpense(event.depense)}</strong>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" aria-hidden="true" />{new Date(`${event.dateevent}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span className="inline-flex items-center gap-1.5"><CircleDollarSign className="size-3.5" aria-hidden="true" />{categoryLabel(event.categoriedepense)}</span>
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
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}

export { expenseEvents }
