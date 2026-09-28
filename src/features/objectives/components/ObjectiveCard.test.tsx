import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Animal } from '@/features/animals/types/animal'
import type { Objective } from '@/features/objectives/types/objective'

import { ObjectiveCard } from './ObjectiveCard'

vi.mock('@/features/animals/components/AnimalAvatar', () => ({
  AnimalAvatar: ({ animal }: { animal: Animal }) => <span data-testid={`avatar-${animal.id}`} />,
}))

const objective = {
  id: 8,
  title: 'Reprendre le travail',
  temporalityobjectif: 'tobedelete',
  animaux: [2],
  sousetapes: [
    { id: 12, etape: 'Marcher vingt minutes', state: false, order: 2 },
    { id: 11, etape: 'Préparer le matériel', state: true, order: 1 },
    { id: 13, etape: 'Faire le bilan', state: false, order: 3 },
  ],
} as Objective

const animal = { id: 2, nom: 'Aria', espece: 'Cheval', provenance: 'owner' } as Animal

describe('ObjectiveCard', () => {
  it('affiche toutes les étapes, masque les valeurs techniques et nomme l’animal', () => {
    render(
      <ObjectiveCard
        objective={objective}
        animals={[animal]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onComplete={vi.fn()}
        onUpdateAnimalImage={vi.fn()}
      />,
    )

    expect(screen.getByText('Préparer le matériel')).toBeInTheDocument()
    expect(screen.getByText('Marcher vingt minutes')).toBeInTheDocument()
    expect(screen.getByText('Faire le bilan')).toBeInTheDocument()
    expect(screen.queryByText('tobedelete')).not.toBeInTheDocument()
    expect(screen.getByTestId('avatar-2')).toBeInTheDocument()
    expect(screen.getByText('Aria')).toBeInTheDocument()
  })

  it('utilise la palette Vasco pour un objectif atteint', () => {
    render(
      <ObjectiveCard
        objective={{
          ...objective,
          sousetapes: objective.sousetapes.map((step) => ({ ...step, state: true })),
        }}
        animals={[animal]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onComplete={vi.fn()}
        onUpdateAnimalImage={vi.fn()}
      />,
    )

    const status = screen.getByText('Objectif atteint')
    expect(status).toHaveClass('text-bai-brun')
    expect(status).not.toHaveClass('text-success')
  })
})
