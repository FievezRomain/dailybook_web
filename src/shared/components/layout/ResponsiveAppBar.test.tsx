import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ResponsiveAppBar from './ResponsiveAppBar'

const mocks = vi.hoisted(() => ({ pathname: '/dashboard' }))

vi.mock('next/navigation', () => ({ usePathname: () => mocks.pathname }))
vi.mock('@/features/notifications/components/NotificationBell', () => ({ NotificationBell: () => <span>Notifications</span> }))
vi.mock('@/features/user/components/UserButton', () => ({ default: () => <span>Compte</span> }))
vi.mock('./GlobalCreate', () => ({ GlobalCreate: () => <button type="button">Créer</button> }))

function renderAppBar(client = new QueryClient()) {
  render(<QueryClientProvider client={client}><ResponsiveAppBar /></QueryClientProvider>)
  return client
}

describe('ResponsiveAppBar', () => {
  beforeEach(() => {
    mocks.pathname = '/dashboard'
  })

  it('affiche le statut de fraîcheur et relance les requêtes actives des pages de données', () => {
    const client = new QueryClient()
    client.setQueryData(['dashboard'], { id: 1 }, { updatedAt: Date.now() })
    const refetchQueries = vi.spyOn(client, 'refetchQueries').mockResolvedValue()

    renderAppBar(client)

    expect(screen.getByRole('heading', { name: 'Accueil' })).toHaveClass('text-lg')
    fireEvent.click(screen.getByRole('button', { name: /Actualiser les données — À l'instant/ }))
    expect(refetchQueries).toHaveBeenCalledWith({ type: 'active' })
  })

  it('ne propose pas de rafraîchissement sur la page compte', () => {
    mocks.pathname = '/profile'
    renderAppBar()

    expect(screen.queryByRole('button', { name: /Actualiser les données/ })).not.toBeInTheDocument()
  })
})
