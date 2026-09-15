import { fireEvent, render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { CompactNavigation } from './CompactNavigation'

describe('CompactNavigation Vasco', () => {
  beforeAll(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  })

  it('conserve cinq destinations stables et ouvre les destinations secondaires', () => {
    render(<CompactNavigation currentPath="/calendar" />)

    expect(screen.getByRole('navigation', { name: 'Navigation principale' })).toHaveClass('h-20', 'max-w-[358px]')
    expect(screen.getByRole('link', { name: 'Agenda' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getAllByRole('link')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'Suivi' })).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Autre' }))

    expect(screen.getByRole('dialog')).toHaveAttribute('data-size', 'expanded')
    expect(screen.getByRole('navigation', { name: 'Autres destinations' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Notes' })).toHaveAttribute('href', '/notes')
  })

  it('marque Autre comme actif sur une destination secondaire', () => {
    render(<CompactNavigation currentPath="/notes" />)
    expect(screen.getByRole('button', { name: 'Autre' })).toHaveAttribute('aria-current', 'page')
  })

  it('reste visible sur Suivi et propose Objectifs ou Statistiques sans redirection immédiate', () => {
    render(<CompactNavigation currentPath="/performances/statistics" />)

    const navigation = screen.getByRole('navigation', { name: 'Navigation principale' })
    const tracking = screen.getByRole('button', { name: 'Suivi' })
    expect(navigation).toBeVisible()
    expect(tracking).toHaveAttribute('aria-current', 'page')

    fireEvent.click(tracking)

    expect(screen.getByRole('navigation', { name: 'Destinations de suivi' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Objectifs' })).toHaveAttribute('href', '/performances/objectives')
    expect(screen.getByRole('link', { name: 'Statistiques' })).toHaveAttribute('href', '/performances/statistics')
  })
})
