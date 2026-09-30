import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import HomePage from './page'

vi.mock('@/lib/auth/server/withGuestPage', () => ({
  withGuestPage: (renderPage: () => unknown) => renderPage(),
}))

describe('Accueil public', () => {
  it('présente la promesse Vasco et les deux accès au parcours Auth', async () => {
    render(await HomePage())

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Moins de charge mentale,\s*plus de moments pour votre animal\./)
    expect(screen.getByRole('link', { name: /Commencer avec Vasco/ })).toHaveAttribute('href', '/register')
    expect(screen.getByRole('link', { name: /J’ai déjà un compte/ })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('complementary', { name: 'Météo locale' })).toBeVisible()
    expect(screen.getByText('Reprise en douceur')).toBeVisible()
    expect(screen.queryByText('3 moments')).not.toBeInTheDocument()
    expect(screen.getByText('Retrouvez simplement le quotidien de vos animaux.')).toBeVisible()
    expect(screen.getByRole('region', { name: 'Comparatif des offres Gratuit et Premium' })).toBeVisible()
    expect(screen.getByText('Gestion de plus de trois animaux')).toBeVisible()
    expect(screen.queryByText(/Vernais/)).not.toBeInTheDocument()
  })
})
