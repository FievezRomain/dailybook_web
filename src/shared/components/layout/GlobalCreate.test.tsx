import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GlobalCreate } from './GlobalCreate'

const mocks = vi.hoisted(() => ({
  openEvent: vi.fn(),
  openAnimal: vi.fn(),
  openObjective: vi.fn(),
  openPremium: vi.fn(),
  push: vi.fn(),
  currentUser: vi.fn(),
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('@/features/events/context/event-form-drawer-context', () => ({ useEventFormDrawer: () => ({ openDrawer: mocks.openEvent }) }))
vi.mock('@/features/animals/context/animal-form-drawer-context', () => ({ useAnimalFormDrawer: () => ({ openDrawer: mocks.openAnimal }) }))
vi.mock('@/features/objectives/context/objective-form-drawer-context', () => ({ useObjectiveFormDrawer: () => ({ openDrawer: mocks.openObjective }) }))
vi.mock('@/features/user/hooks/use-current-user', () => ({ useCurrentUser: mocks.currentUser }))
vi.mock('@/shared/components/feedback/PremiumGate', () => ({ usePremiumDialog: () => ({ openPremiumDialog: mocks.openPremium }) }))

describe('GlobalCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.currentUser.mockReturnValue({ user: { email: 'romain@example.test' }, isPremium: false })
  })

  it('reproduit les cinq choix de création validés et ouvre une dépense comme événement', () => {
    render(<GlobalCreate currentPath="/dashboard" />)
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }))

    expect(screen.getByRole('heading', { name: 'Créer' })).toBeVisible()
    expect(screen.getByText('Rendez-vous, soin ou activité')).toBeVisible()
    expect(screen.getByText('Coordination partagée')).toBeVisible()
    expect(screen.getByText('Un cap et ses prochaines étapes')).toBeVisible()
    expect(screen.getByText('Personne ou professionnel utile')).toBeVisible()
    expect(screen.getByText('Une envie à garder en vue')).toBeVisible()
    expect(screen.queryByText('Ajouter un contact')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Dépense/ }))
    expect(mocks.openEvent).toHaveBeenCalledWith(expect.objectContaining({ initialEvent: expect.objectContaining({ eventtype: 'depense' }) }))
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
    expect(mocks.push).toHaveBeenCalledWith('/groups?create=1')
  })
})
