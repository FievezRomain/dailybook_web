import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const push = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  usePathname: () => '/animals',
  useRouter: () => ({ push }),
}))

import { CommandPalette } from './CommandPalette'

describe('CommandPalette', () => {
  beforeEach(() => {
    push.mockReset()
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })) })
  })

  it('s’ouvre au raccourci primaire et filtre les destinations', async () => {
    render(<CommandPalette />)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    const input = await screen.findByRole('textbox', { name: 'Rechercher une commande' })
    fireEvent.change(input, { target: { value: 'compte' } })
    expect(screen.getByRole('option', { name: /Compte/ })).toBeVisible()
    expect(screen.queryByRole('option', { name: /Agenda/ })).not.toBeInTheDocument()
  })

  it('explicite un état vide et revient au déclencheur à la fermeture', async () => {
    render(<CommandPalette />)
    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    const input = await screen.findByRole('textbox', { name: 'Rechercher une commande' })
    fireEvent.change(input, { target: { value: 'inconnu' } })
    expect(screen.getByText('Aucune commande trouvée')).toBeVisible()
    fireEvent.keyDown(input, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Rechercher une commande' })).not.toBeInTheDocument())
  })

  it('navigue par une action sans conserver la modale ouverte', async () => {
    render(<CommandPalette />)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    await screen.findByRole('textbox', { name: 'Rechercher une commande' })
    fireEvent.click(screen.getByRole('option', { name: /Créer un événement/ }))
    expect(push).toHaveBeenCalledWith('/calendar?create=1')
    await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Rechercher une commande' })).not.toBeInTheDocument())
  })
})
