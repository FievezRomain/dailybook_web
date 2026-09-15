import { Stethoscope } from 'lucide-react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Animal } from '@/features/animals/types/animal'
import type { MappedEvent } from '@/features/events/types/event'

import { EventCard } from './EventCard'

vi.mock('@/features/animals/components/AnimalAvatar', () => ({
  AnimalAvatar: ({ animal }: { animal: Animal }) => <span>{animal.nom}</span>,
}))

const animal = { id: 2, nom: 'Aria', espece: 'Chat', provenance: 'owner' } as Animal
const event = {
  id: 8,
  nom: 'Vaccin annuel',
  dateevent: '2026-09-10',
  animaux: [2],
  eventtype: 'soins',
  state: 'À faire',
  heuredebutevent: '14:00',
  lieu: 'Clinique des Tilleuls',
  documents: [],
  shared_groups: [],
  todisplay: true,
  icon: Stethoscope,
  color: 'var(--event-soins)',
  titleType: 'Soins',
} as MappedEvent

function renderCard(overrides: Partial<React.ComponentProps<typeof EventCard>> = {}) {
  const props = {
    event,
    animals: [animal],
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onComplete: vi.fn(),
    onOpenDrawer: vi.fn(),
    onDuplicate: vi.fn(),
    onUpdateAnimalImage: vi.fn(),
    ...overrides,
  }
  render(<EventCard {...props} />)
  return props
}

describe('EventCard', () => {
  it('présente le type, le titre et les métadonnées dans une surface colorée cohérente', () => {
    renderCard()

    const card = screen.getByLabelText('Carte d’événement Vaccin annuel')
    expect(card).toHaveClass('event-card-surface', 'event-tone-soins')
    expect(screen.getByText('Soins')).toBeVisible()
    expect(screen.getByText('Vaccin annuel')).toBeVisible()
    expect(screen.getByText('14:00')).toBeVisible()
    expect(screen.getByText('Clinique des Tilleuls')).toBeVisible()
    expect(screen.getByText('Aria')).toBeVisible()
  })

  it('ouvre la fiche détail et permet de terminer directement l’événement', async () => {
    const user = userEvent.setup()
    const props = renderCard()

    await user.click(screen.getByRole('button', { name: /^Vaccin annuel / }))
    expect(props.onOpenDrawer).toHaveBeenCalledWith(event)

    await user.click(screen.getByRole('checkbox', { name: 'Marquer Vaccin annuel comme terminé' }))
    expect(props.onComplete).toHaveBeenCalledWith(8, expect.objectContaining({ state: 'Terminé' }))
  })
})
