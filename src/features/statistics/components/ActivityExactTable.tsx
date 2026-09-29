import { Fragment } from 'react'

import { Card } from '@/shared/components/ui/card'
import { RatingStars } from '@/shared/components/ui/rating-stars'

import type { EventStatistics } from '../types/statistics'
import { eventsByDate } from './EventActivityHeatmap'

function placementLabel(value?: string) {
  const placement = value?.trim()
  if (!placement) return 'Non renseigné'
  if (/^\d+$/.test(placement)) return placement === '1' ? '1re place' : `${placement}e place`
  return placement
}

export function ActivityExactTable({
  includeRanking = false,
  result,
}: {
  includeRanking?: boolean
  result: EventStatistics
}) {
  const events = [...eventsByDate(result).values()]
    .flat()
    .sort((left, right) => right.dateevent.localeCompare(left.dateevent))

  return (
    <Card className="gap-0 overflow-hidden rounded-[24px] p-0 shadow-surface">
      <header className="border-b bg-muted/20 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">Données sources</p>
        <h2 className="mt-1 text-lg font-semibold">Valeurs exactes</h2>
        <p className="mt-1 text-xs text-muted-foreground">Notes attribuées aux événements affichés dans la heatmap.</p>
      </header>
      <div className="overflow-x-auto p-5">
        <table className="w-full min-w-[660px] text-left text-sm">
          <caption className="sr-only">Notes détaillées des événements physiques</caption>
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Événement</th>
              <th className="px-3 py-2 font-medium">Indicateur</th>
              <th className="px-3 py-2 font-medium">{includeRanking ? 'Valeur réelle' : 'Note réelle'}</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <Fragment key={event.id}>
                <tr className={includeRanking ? 'border-b border-border/60' : 'border-b last:border-0'}>
                  <td rowSpan={includeRanking ? 2 : 1} className="px-3 py-3 align-top">{new Date(`${event.dateevent}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  <td rowSpan={includeRanking ? 2 : 1} className="px-3 py-3 align-top font-semibold">{event.nom}</td>
                  <td className="px-3 py-3">Note</td>
                  <td className="px-3 py-3">{event.note !== undefined ? <RatingStars value={event.note} /> : <span className="text-muted-foreground">Non noté</span>}</td>
                </tr>
                {includeRanking && (
                  <tr className="border-b last:border-0 bg-muted/15">
                    <td className="px-3 py-3">Classement</td>
                    <td className="px-3 py-3 font-semibold">{placementLabel(event.placement)}</td>
                  </tr>
                )}
              </Fragment>
            ))}
            {events.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">Aucun événement détaillé pour cette période.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
