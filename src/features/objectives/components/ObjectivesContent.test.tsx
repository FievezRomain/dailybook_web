import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const refetch = vi.fn()
let queryState = { objectives: [] as Array<Record<string, unknown>>, isLoading: false, isError: false, refetch }

vi.mock('@/features/objectives/hooks/use-objectives', () => ({ useObjectivesQuery: () => queryState }))
vi.mock('@/features/animals/hooks/use-animals', () => ({
  useAnimalsQuery: () => ({ animals: [], isLoading: false, isError: false, updateAnimalImage: vi.fn() }),
}))
vi.mock('./ObjectiveList', () => ({ ObjectiveList: ({ objectives }: { objectives: Array<{ title: string }> }) => <div>{objectives.map(({ title }) => <p key={title}>{title}</p>)}</div> }))

import ObjectivesContent from './ObjectivesContent'

describe('ObjectivesContent', () => {
  it('présente une progression visuelle et sépare les objectifs actifs des terminés', () => {
    queryState = { objectives: [
      { id: 1, title: 'Routine', animaux: [], sousetapes: [{ id: 1, state: false }] },
      { id: 2, title: 'Poids cible', animaux: [], sousetapes: [{ id: 2, state: true }] },
    ], isLoading: false, isError: false, refetch }

    render(<ObjectivesContent />)

    expect(screen.getByRole('img', { name: 'Progression globale : 50 pour cent' })).toBeInTheDocument()
    expect(screen.getByText('Routine')).toBeInTheDocument()
    expect(screen.queryByText('Poids cible')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: /Terminés/ }))
    expect(screen.getByText('Poids cible')).toBeInTheDocument()
  })

  it('propose une relance après une erreur et renvoie vers la création globale depuis le vide', () => {
    queryState = { objectives: [], isLoading: false, isError: true, refetch }
    const { rerender } = render(<ObjectivesContent />)
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }))
    expect(refetch).toHaveBeenCalledOnce()

    queryState = { objectives: [], isLoading: false, isError: false, refetch }
    rerender(<ObjectivesContent />)
    expect(screen.getByText(/action Créer du menu principal/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Créer un objectif/ })).not.toBeInTheDocument()
  })
})
