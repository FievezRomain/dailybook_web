import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GlobalCreate } from './GlobalCreate'

const mocks = vi.hoisted(() => ({
  openEvent: vi.fn(),
  openAnimal: vi.fn(),
  openObjective: vi.fn(),
  openPremium: vi.fn(),
  openEntityForm: vi.fn(),
  currentUser: vi.fn(),
}))

vi.mock('@/features/events/context/event-form-drawer-context', () => ({ useEventFormDrawer: () => ({ openDrawer: mocks.openEvent }) }))
vi.mock('@/features/animals/context/animal-form-drawer-context', () => ({ useAnimalFormDrawer: () => ({ openDrawer: mocks.openAnimal }) }))
vi.mock('@/features/objectives/context/objective-form-drawer-context', () => ({ useObjectiveFormDrawer: () => ({ openDrawer: mocks.openObjective }) }))
vi.mock('@/features/user/hooks/use-current-user', () => ({ useCurrentUser: mocks.currentUser }))
vi.mock('@/shared/components/feedback/PremiumGate', () => ({ usePremiumDialog: () => ({ openPremiumDialog: mocks.openPremium }) }))
vi.mock('@/shared/components/providers/GlobalCreateProvider', () => ({ useGlobalCreate: () => ({ openEntityForm: mocks.openEntityForm }) }))

describe('GlobalCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.currentUser.mockReturnValue({ user: { email: 'romain@example.test' }, isPremium: false })
  })

  it('reprend les sept choix mobiles dans le même ordre avec les mêmes textes et icônes', () => {
    render(<GlobalCreate currentPath="/dashboard" />)
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }))

    expect(screen.getByRole('heading', { name: 'Créer' })).toBeVisible()
    const expected = [
      ['Événement', 'Planifier un soin, une balade ou un rendez-vous'],
      ['Animal', 'Ajouter un nouveau compagnon et son profil'],
      ['Objectif', 'Définir un suivi avec une échéance et des étapes'],
      ['Note', 'Écrire rapidement ou enregistrer avec la voix'],
      ['Contact', 'Enregistrer une personne et ses informations utiles'],
      ['Souhait', 'Garder une idée avec son prix éventuel'],
      ['Groupe', 'Créer un espace partagé pour vos proches et animaux'],
    ] as const
    const choiceButtons = expected.map(([label, description]) => {
      expect(screen.getByText(description)).toBeVisible()
      const button = screen.getByRole('button', { name: new RegExp(`^${label}`) })
      expect(button.querySelector('svg')).toBeInTheDocument()
      return button
    })
    expect(Array.from(choiceButtons[0].parentElement?.children ?? [])).toEqual(choiceButtons)
    expect(screen.queryByRole('button', { name: /Dépense/ })).not.toBeInTheDocument()

    fireEvent.click(choiceButtons[0])
    expect(mocks.openEvent).toHaveBeenCalledWith(expect.objectContaining({ initialEvent: expect.objectContaining({ eventtype: 'autre' }) }))
  })

  it('conserve le verrou Premium groupe et oriente un membre Premium vers la création', () => {
    const { rerender } = render(<GlobalCreate currentPath="/dashboard" />)
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }))
    fireEvent.click(screen.getByRole('button', { name: /Groupe/ }))
    expect(mocks.openPremium).toHaveBeenCalledWith('groupManagement')

    mocks.currentUser.mockReturnValue({ user: { email: 'romain@example.test' }, isPremium: true })
    rerender(<GlobalCreate currentPath="/dashboard" />)
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }))
    fireEvent.click(screen.getByRole('button', { name: /Groupe/ }))
    expect(mocks.openEntityForm).toHaveBeenCalledWith('group')
  })

  it.each([
    ['Note', 'note'],
    ['Contact', 'contact'],
    ['Souhait', 'wish'],
  ] as const)('ouvre %s sans rediriger la page courante', (label, entity) => {
    render(<GlobalCreate currentPath="/dashboard" />)
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }))
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${label}`) }))

    expect(mocks.openEntityForm).toHaveBeenCalledWith(entity)
  })
})
