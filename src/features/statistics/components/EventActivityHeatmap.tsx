import { useState } from 'react'
import { eachDayOfInterval, endOfWeek, format, parseISO, startOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'

import type { Animal } from '@/features/animals/types/animal'
import type { Event } from '@/features/events/types/event'
import { cn } from '@/lib/utils'
import type { ImageSigned } from '@/types/image'

import type { EventStatistics } from '../types/statistics'
import { ActivityEventCards } from './ActivityEventCards'

function localDateKey(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

function activityByDate(result: EventStatistics) {
  const activity = new Map<string, number>()
  const eventIds = new Set<number>()

  result.statistic.forEach((item) => {
    if (item.events.length > 0) {
      item.events.forEach((event) => {
        if (eventIds.has(event.id)) return
        eventIds.add(event.id)
        activity.set(event.dateevent, (activity.get(event.dateevent) ?? 0) + 1)
      })
      return
    }

    if (item.date) {
      const count = item.count ?? (item.exact_value ?? item.value ?? 0)
      activity.set(item.date, (activity.get(item.date) ?? 0) + Math.max(Number(count), 0))
    }
  })

  return activity
}

function eventsByDate(result: EventStatistics) {
  const grouped = new Map<string, Event[]>()
  const eventIds = new Set<number>()

  result.statistic.forEach((item) => item.events.forEach((event) => {
    if (eventIds.has(event.id)) return
    eventIds.add(event.id)
    grouped.set(event.dateevent, [...(grouped.get(event.dateevent) ?? []), event])
  }))

  return grouped
}

function ratingByDate(result: EventStatistics) {
  const ratings = new Map<string, number[]>()
  const eventIds = new Set<number>()

  result.statistic.forEach((item) => {
    item.events.forEach((event) => {
      if (eventIds.has(event.id)) return
      eventIds.add(event.id)
      if (event.note !== undefined) ratings.set(event.dateevent, [...(ratings.get(event.dateevent) ?? []), event.note])
    })

    if (item.events.length === 0 && item.date) {
      const fallbackRating = item.exact_value ?? item.value
      if (fallbackRating !== undefined && fallbackRating !== null) {
        ratings.set(item.date, [...(ratings.get(item.date) ?? []), fallbackRating])
      }
    }
  })

  return new Map([...ratings].map(([date, values]) => [
    date,
    values.reduce((sum, value) => sum + value, 0) / values.length,
  ]))
}

function heatmapTone(rating: number | undefined, hasActivity: boolean) {
  if (!hasActivity) return 'border-border/60 bg-muted/45'
  if (rating === undefined) return 'border-rouan bg-rouan/65'
  if (rating <= 1) return 'border-palomino bg-palomino/80'
  if (rating <= 2) return 'border-isabelle bg-isabelle/80'
  if (rating <= 3) return 'border-alezan bg-alezan/85'
  if (rating <= 4) return 'border-bai-cerise bg-bai-cerise/90'
  return 'border-bai-brun bg-bai-brun'
}

export function EventActivityHeatmap({
  animals,
  dateDebut,
  dateFin,
  label,
  onOpenEvent,
  onUpdateAnimalImage,
  result,
}: {
  animals: Animal[]
  dateDebut: string
  dateFin: string
  label: string
  onOpenEvent: (event: Event) => void
  onUpdateAnimalImage: (id: number, image: ImageSigned) => void
  result: EventStatistics
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const activity = activityByDate(result)
  const ratings = ratingByDate(result)
  const detailedEvents = eventsByDate(result)
  const firstDay = startOfWeek(parseISO(dateDebut), { weekStartsOn: 1 })
  const lastDay = endOfWeek(parseISO(dateFin), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: firstDay, end: lastDay })
  const total = [...activity.values()].reduce((sum, value) => sum + value, 0)
  const selectedEvents = selectedDate ? detailedEvents.get(selectedDate) ?? [] : []

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Régularité des activités</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {total} activité{total > 1 ? 's' : ''} sur la période sélectionnée
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground" aria-label="Échelle des notes">
          <span>1</span>
          {[1, 2, 3, 4, 5].map((level) => (
            <span
              key={level}
              className={cn('size-4 rounded-[5px] border', heatmapTone(level, true))}
              aria-hidden="true"
            />
          ))}
          <span>5 étoiles</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max items-start gap-2">
          <div className="grid grid-rows-7 gap-1.5 pt-0.5 text-[10px] leading-5 text-muted-foreground" aria-hidden="true">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => <span key={`${day}-${index}`} className="h-6 w-4 text-center leading-6">{day}</span>)}
          </div>
          <div
            className="grid grid-flow-col grid-rows-7 gap-1.5"
            role="group"
            aria-label={`Heatmap ${label.toLocaleLowerCase('fr-FR')} : ${total} activité${total > 1 ? 's' : ''}`}
          >
            {days.map((day) => {
              const date = localDateKey(day)
              const value = activity.get(date) ?? 0
              const rating = ratings.get(date)
              const outsidePeriod = date < dateDebut || date > dateFin
              const readableDate = format(day, 'd MMMM yyyy', { locale: fr })
              if (!outsidePeriod && value > 0) {
                return (
                  <button
                    key={date}
                    type="button"
                    aria-label={`${readableDate} : ${value} activité${value > 1 ? 's' : ''}${rating === undefined ? ', sans note' : `, note ${rating.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} sur 5`}`}
                    aria-pressed={selectedDate === date}
                    title={`${readableDate} · ${value} activité${value > 1 ? 's' : ''}${rating === undefined ? ' · sans note' : ` · ${rating.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}/5`}`}
                    className={cn(
                      'size-6 cursor-pointer rounded-[7px] border outline-none ring-1 ring-inset ring-bai-brun/70 shadow-sm transition-[transform,box-shadow] hover:scale-110 hover:ring-2 focus-visible:scale-110 focus-visible:ring-2 focus-visible:ring-ring dark:ring-palomino/70',
                      heatmapTone(rating, true),
                      selectedDate === date && 'ring-2 ring-primary ring-offset-2 ring-offset-card',
                    )}
                    onClick={() => setSelectedDate(date)}
                  />
                )
              }

              return <span key={date} aria-hidden="true" className={cn('size-6 rounded-[7px] border', outsidePeriod ? 'border-transparent bg-transparent' : heatmapTone(undefined, false))} />
            })}
          </div>
        </div>
      </div>

      {total === 0 && <p className="mt-3 text-sm text-muted-foreground">Aucune activité enregistrée sur cette période.</p>}
      {selectedDate && (
        <section className="mt-5 border-t pt-5" aria-live="polite">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">Événements du jour</p>
          <h3 className="mt-1 text-lg font-semibold">{format(parseISO(selectedDate), 'd MMMM yyyy', { locale: fr })}</h3>
          {selectedEvents.length > 0 ? (
            <ActivityEventCards events={selectedEvents} animals={animals} onOpenEvent={onOpenEvent} onUpdateAnimalImage={onUpdateAnimalImage} />
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Le total est disponible, mais le détail des événements n’a pas été fourni.</p>
          )}
        </section>
      )}
    </div>
  )
}

export { activityByDate, eventsByDate, ratingByDate }
