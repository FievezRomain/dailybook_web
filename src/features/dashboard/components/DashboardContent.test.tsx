import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import DashboardContent from './DashboardContent'

const mocks = vi.hoisted(() => ({ openAnimal: vi.fn(), animals: [] as Array<{ id: number }> }))

vi.mock('@/features/animals/hooks/use-animals', () => ({
  useAnimalsQuery: () => ({ animals: mocks.animals, isLoading: false, isError: false }),
}))
vi.mock('@/features/animals/context/animal-form-drawer-context', () => ({
  useAnimalFormDrawer: () => ({ openDrawer: mocks.openAnimal }),
}))
vi.mock('@/features/user/hooks/use-current-user', () => ({
  useCurrentUser: () => ({ user: { name: 'Camille Dupont' }, isLoading: false }),
}))
vi.mock('./GridCards', () => ({ default: () => <div>Grille Home</div> }))
vi.mock('@/features/weather/components/WeatherCard', () => ({ WeatherCard: () => <div>Météo</div> }))
vi.mock('@/features/groups/components/GroupOnboarding', () => ({ GroupOnboarding: () => <div>Onboarding groupe</div> }))

describe('DashboardContent', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mocks.animals = []
    mocks.openAnimal.mockReset()
  })

  it('présente le parcours premier accès et ouvre le formulaire animal réel', async () => {
    const user = userEvent.setup()
    render(<DashboardContent />)

    expect(screen.getByRole('heading', { name: 'Bienvenue dans votre espace Vasco.' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: /Commencer avec un animal/ }))
    expect(mocks.openAnimal).toHaveBeenCalledOnce()
  })

  it('mémorise le choix de passer puis affiche la Home', async () => {
    const user = userEvent.setup()
    render(<DashboardContent />)

    await user.click(screen.getByRole('button', { name: 'Passer cette étape' }))
    expect(window.localStorage.getItem('vasco:onboarding-complete')).toBe('true')
    expect(screen.getByText('Grille Home')).toBeVisible()
    expect(screen.getByText('Onboarding groupe')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Bonjour Camille' })).toBeVisible()
    expect(screen.getByText('Météo')).toBeVisible()
  })
})
