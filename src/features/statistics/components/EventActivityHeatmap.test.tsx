import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Animal } from '@/features/animals/types/animal'
import type { EventStatistics } from '../types/statistics'
import { EventActivityHeatmap, activityByDate, eventsByDate, ratingByDate } from './EventActivityHeatmap'

vi.mock('@/features/animals/components/AnimalAvatar', () => ({ AnimalAvatar: () => <span /> }))

const walk = {
  id: 12,
  nom: 'Balade en forêt',
  dateevent: '2026-09-08',
  animaux: [4],
  eventtype: 'balade',
  state: 'Terminé',
  note: 4,
  documents: [],
  shared_groups: [],
  todisplay: true,
}

const result = {
  statistic: [
    { date: '2026-09-08', count: 1, events: [walk] },
    { date: '2026-09-08', count: 1, events: [walk] },
    { date: '2026-09-10', count: 2, events: [] },
  ],
} as EventStatistics

describe('EventActivityHeatmap', () => {
  it('agrège les activités par jour sans compter deux fois un même événement', () => {
    expect([...activityByDate(result).entries()]).toEqual([
      ['2026-09-08', 1],
      ['2026-09-10', 2],
    ])
    expect(eventsByDate(result).get('2026-09-08')).toHaveLength(1)
    expect(ratingByDate(result).get('2026-09-08')).toBe(4)
  })

  it('présente une heatmap calendaire accessible', () => {
    const onOpenEvent = vi.fn()
    render(
      <EventActivityHeatmap
        animals={[{ id: 4, nom: 'Vasco', provenance: 'owner' } as Animal]}
        dateDebut="2026-09-01"
        dateFin="2026-09-30"
        label="Balades"
        onOpenEvent={onOpenEvent}
        onUpdateAnimalImage={vi.fn()}
        result={result}
      />,
    )

    expect(screen.getByRole('group', { name: 'Heatmap balades : 3 activités' })).toBeInTheDocument()
    expect(screen.getByLabelText('8 septembre 2026 : 1 activité, note 4 sur 5')).toHaveClass('ring-bai-brun/70')
    expect(screen.getByLabelText('10 septembre 2026 : 2 activités, sans note')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '8 septembre 2026 : 1 activité, note 4 sur 5' }))

    expect(screen.getByRole('heading', { name: '8 septembre 2026' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Balade en forêt' })).toBeInTheDocument()
    expect(screen.getByText('Vasco')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '4 étoiles sur 5' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir les détails de Balade en forêt' }))
    expect(onOpenEvent).toHaveBeenCalledWith(expect.objectContaining({ id: 12 }))
  })
})
