import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Animal } from '@/features/animals/types/animal'
import type { EventStatistics } from '../types/statistics'
import { ExpenseBreakdown } from './ExpenseBreakdown'

vi.mock('@/features/animals/components/AnimalAvatar', () => ({ AnimalAvatar: () => <span /> }))

const equipmentEvent = {
  id: 1,
  nom: 'Couverture imperméable',
  dateevent: '2026-09-12',
  animaux: [4],
  eventtype: 'depense',
  state: 'Terminé',
  depense: 80,
  categoriedepense: 'equipement',
  documents: [],
  shared_groups: [],
  todisplay: true,
}

const healthEvent = {
  ...equipmentEvent,
  id: 2,
  nom: 'Vermifuge',
  depense: 25,
  categoriedepense: 'sante',
}

const result = {
  statistic: [
    { name: 'Équipement', exact_value: 80, count: 1, date: '2026-09-12', events: [equipmentEvent] },
    { name: 'Santé', exact_value: 25, count: 1, date: '2026-09-15', events: [healthEvent] },
  ],
} as EventStatistics

describe('ExpenseBreakdown', () => {
  it('affiche les valeurs sans date puis révèle les événements de la catégorie choisie', () => {
    render(
      <ExpenseBreakdown
        result={result}
        animals={[{ id: 4, nom: 'Vasco', provenance: 'owner' } as Animal]}
        onUpdateAnimalImage={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Valeurs exactes' })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Date' })).not.toBeInTheDocument()
    expect(screen.queryByText('Couverture imperméable')).not.toBeInTheDocument()
    expect(screen.getByText(/Choisissez une catégorie/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Équipement' }))

    expect(screen.getByRole('heading', { name: 'Événements · Équipement' })).toBeInTheDocument()
    expect(screen.getByText('Couverture imperméable')).toBeInTheDocument()
    expect(screen.queryByText('Vermifuge')).not.toBeInTheDocument()
  })
})
