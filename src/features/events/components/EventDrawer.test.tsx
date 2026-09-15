import { Stethoscope } from 'lucide-react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Animal } from '@/features/animals/types/animal'
import type { MappedEvent } from '@/features/events/types/event'

import { EventDrawer } from './EventDrawer'

vi.mock('@/features/animals/components/AnimalAvatar', () => ({
  AnimalAvatar: ({ animal }: { animal: Animal }) => <span>{animal.nom}</span>,
}))
vi.mock('@/shared/components/feedback/MediaViewer', () => ({ MediaViewer: () => null }))

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
  specialiste: 'Dr Martin',
  traitement: 'Rappel annuel',
  commentaire: 'Apporter le carnet de santé.',
  documents: [],
  shared_groups: [{ id: 4, name: 'Famille' }],
  todisplay: true,
  icon: Stethoscope,
  color: 'var(--event-soins)',
  titleType: 'Soins',
} as MappedEvent

describe('EventDrawer', () => {
  it('hiérarchise les informations générales, métier et relationnelles', () => {
    render(<EventDrawer open onClose={vi.fn()} event={event} animals={[animal]} onEdit={vi.fn()} onDelete={vi.fn()} onUpdateAnimalImage={vi.fn()} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveClass('event-tone-soins')
    expect(screen.getByRole('heading', { name: 'Vaccin annuel' })).toBeVisible()
    expect(screen.getByText('Clinique des Tilleuls')).toBeVisible()
    expect(screen.getByText('Dr Martin')).toBeVisible()
    expect(screen.getByText('Rappel annuel')).toBeVisible()
    expect(screen.getByText('Apporter le carnet de santé.')).toBeVisible()
    expect(screen.getAllByText('Aria')).toHaveLength(2)
    expect(screen.getByText('Famille')).toBeVisible()
  })

  it('conserve les actions modifier, supprimer et fermer', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const onClose = vi.fn()
    render(<EventDrawer open onClose={onClose} event={event} animals={[animal]} onEdit={onEdit} onDelete={onDelete} onUpdateAnimalImage={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Modifier l’événement' }))
    await user.click(screen.getByRole('button', { name: 'Supprimer' }))
    await user.click(screen.getByRole('button', { name: 'Fermer le détail' }))

    expect(onEdit).toHaveBeenCalledOnce()
    expect(onDelete).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })
})
