import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Animal } from '@/features/animals/types/animal'
import type { EventStatistics } from '../types/statistics'
import { ExpenseEventCards, expenseEvents } from './ExpenseEventCards'

vi.mock('@/features/animals/components/AnimalAvatar', () => ({
  AnimalAvatar: ({ animal }: { animal: Animal }) => <span data-testid={`animal-${animal.id}`} />,
}))

const expense = {
  id: 21,
  nom: 'Nouvelle couverture',
  dateevent: '2026-09-12',
  animaux: [4],
  eventtype: 'depense',
  state: 'Terminé',
  depense: 89.9,
  categoriedepense: 'equipement',
  documents: [],
  shared_groups: [],
  todisplay: true,
}

const result = {
  statistic: [
    { name: 'Équipement', exact_value: 89.9, events: [expense] },
    { name: 'Toutes', exact_value: 89.9, events: [expense] },
  ],
} as EventStatistics

describe('ExpenseEventCards', () => {
  it('déduplique et affiche les événements à l’origine des dépenses', () => {
    expect(expenseEvents(result)).toHaveLength(1)

    render(
      <ExpenseEventCards
        result={result}
        animals={[{ id: 4, nom: 'Vasco', provenance: 'owner' } as Animal]}
        onUpdateAnimalImage={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Nouvelle couverture' })).toBeInTheDocument()
    expect(screen.getByText('89,9 €')).toBeInTheDocument()
    expect(screen.getByText('Équipement')).toBeInTheDocument()
    expect(screen.getByText('Vasco')).toBeInTheDocument()
  })
})
