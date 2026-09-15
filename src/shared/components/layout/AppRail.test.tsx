import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppRail } from './AppRail'

vi.mock('next/image', () => ({ default: ({ src }: { src: string }) => <span data-testid="logo" data-src={src} /> }))
vi.mock('./GlobalCreate', () => ({ GlobalCreate: ({ expanded }: { expanded?: boolean }) => <button type="button">{expanded ? 'Créer' : 'Créer compact'}</button> }))

describe('AppRail Vasco', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({ matches: query.includes('1536px') || query.includes('1280px'), addEventListener: vi.fn(), removeEventListener: vi.fn() })))
  })

  it('aligne les destinations et imbrique les sous-menus sur grand écran', async () => {
    const user = userEvent.setup()
    render(<AppRail currentPath="/performances/objectives" hideGlobalCreateOnPaths={[]} />)

    expect(await screen.findByText('VASCO')).toHaveClass('text-lg')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Réduire la navigation' })).toBeVisible())
    expect(screen.getByRole('button', { name: 'Suivi' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Autre' })).toBeVisible()
    for (const item of [screen.getByRole('link', { name: 'Accueil' }), screen.getByRole('button', { name: 'Suivi' }), screen.getByRole('button', { name: 'Autre' })]) {
      expect(item).toHaveClass('h-12', 'w-full', 'items-center', 'gap-3', 'rounded-control', 'p-2', 'hover:bg-muted')
    }
    expect(screen.getByRole('button', { name: 'Suivi' }).querySelector('.lucide-chevron-down')).toHaveClass('rotate-180')
    expect(screen.getByRole('link', { name: 'Objectifs' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Statistiques' })).toHaveAttribute('href', '/performances/statistics')
    expect(screen.getByRole('link', { name: 'Objectifs' }).closest('aside')).not.toBeNull()
    const other = screen.getByRole('button', { name: 'Autre' })
    await user.click(other)
    expect(other).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Groupes' })).toHaveAttribute('href', '/groups')
    expect(screen.getByRole('link', { name: 'Souhaits' })).toHaveAttribute('href', '/wishes')
    expect(screen.getByRole('link', { name: 'Groupes' }).closest('aside')).not.toBeNull()
    expect(screen.getByRole('link', { name: 'Profil' })).toHaveAttribute('href', '/profile')
  })

  it('mémorise une réduction fluide sans déplacer le contrôle hors de sa ligne', async () => {
    render(<AppRail currentPath="/dashboard" hideGlobalCreateOnPaths={[]} />)
    const collapse = await screen.findByRole('button', { name: 'Réduire la navigation' })
    expect(collapse.parentElement).toHaveClass('h-11', 'items-center')

    fireEvent.click(collapse)

    expect(window.localStorage.getItem('vasco:rail-expanded')).toBe('false')
    expect(screen.getByRole('button', { name: 'Développer la navigation' })).toBeVisible()
    expect(screen.getByRole('complementary')).toHaveAttribute('data-expanded', 'false')
    expect(screen.getByTestId('logo')).toHaveAttribute('data-src', '/logo.png')
    expect(screen.getByRole('link', { name: 'Accueil' })).toHaveClass('w-full', 'justify-center')
    expect(screen.getByRole('button', { name: 'Suivi' })).toHaveClass('w-full', 'justify-center', 'gap-0')
    expect(screen.getByRole('button', { name: 'Autre' })).toHaveClass('w-full', 'justify-center', 'gap-0')
    expect(screen.getByRole('link', { name: 'Accueil' })).toHaveClass('gap-0')
  })

  it('ouvre le sous-menu Suivi dans un panneau extérieur au rail', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({ matches: query.includes('1280px'), addEventListener: vi.fn(), removeEventListener: vi.fn() })))
    const user = userEvent.setup()
    render(<AppRail currentPath="/performances/statistics" hideGlobalCreateOnPaths={[]} />)
    await screen.findByRole('button', { name: 'Réduire la navigation' })
    const tracking = screen.getByRole('button', { name: 'Suivi' })
    await user.click(tracking)
    expect(screen.getByRole('menuitem', { name: 'Objectifs' })).toBeVisible()
    expect(screen.getByRole('menuitem', { name: 'Objectifs' }).closest('aside')).toBeNull()
  })

  it('marque Autre comme actif sur une destination secondaire', async () => {
    render(<AppRail currentPath="/groups" hideGlobalCreateOnPaths={[]} />)
    await screen.findByRole('button', { name: 'Réduire la navigation' })
    expect(screen.getByRole('button', { name: 'Autre' })).toHaveAttribute('aria-current', 'page')
  })
})
