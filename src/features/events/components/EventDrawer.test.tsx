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
  state: 'completed',
  heuredebutevent: '14:00',
  lieu: 'Clinique des Tilleuls',
  specialiste: 'Dr Martin',
  traitement: 'Rappel annuel',
  note: 4,
  frequencetype: 'recurring',
  frequencevalue: 'weekly',
  rappelnotification: '1d',
  depense: 25,
  categoriedepense: 'equipement',
  commentaire: 'Apporter le carnet de santé.',
  documents: [],
  shared_groups: [{ id: 4, name: 'Famille' }],
  todisplay: true,
  icon: 'stethoscope',
  color: 'var(--event-soins)',
  titleType: 'Soins',
} as MappedEvent

describe('EventDrawer', () => {
  it('hiérarchise les informations générales, métier et relationnelles', () => {
    render(<EventDrawer open onClose={vi.fn()} event={event} animals={[animal]} onEdit={vi.fn()} onDelete={vi.fn()} onUpdateAnimalImage={vi.fn()} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveClass('event-tone-soins')
    expect(screen.getByRole('heading', { name: 'Vaccin annuel' })).toBeVisible()
    expect(screen.getByText('Terminé')).toBeVisible()
    expect(screen.queryByText('completed')).not.toBeInTheDocument()
    expect(screen.queryByText('Tous les éléments utiles de cet événement, sans quitter votre agenda.')).not.toBeInTheDocument()
    expect(screen.getByText('Clinique des Tilleuls')).toBeVisible()
    expect(screen.getByText('Dr Martin')).toBeVisible()
    expect(screen.getByText('Rappel annuel')).toBeVisible()
    expect(screen.getByText('Toutes les semaines')).toBeVisible()
    expect(screen.getByText('1 jour avant')).toBeVisible()
    expect(screen.getByText('Équipement')).toBeVisible()
    expect(screen.queryByText('equipement')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: '4 étoiles sur 5' })).toBeVisible()
    expect(screen.queryByText('4/5')).not.toBeInTheDocument()
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

  it('calcule la durée d’une balade à partir des heures de début et de fin', () => {
    render(<EventDrawer
      open
      onClose={vi.fn()}
      event={{ ...event, eventtype: 'balade', titleType: 'Balade', dateevent: '2026-09-10', heuredebutevent: '14:15', datefinbalade: '2026-09-10', heurefinbalade: '16:00' }}
      animals={[animal]}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onUpdateAnimalImage={vi.fn()}
    />)

    expect(screen.getByText('Durée de la balade')).toBeVisible()
    expect(screen.getByText('1 h 45 min')).toBeVisible()
  })
})
