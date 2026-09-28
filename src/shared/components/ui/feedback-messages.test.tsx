import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Banner, InlineMessage } from './message'

describe('messages persistants Vasco', () => {
  it('annonce immédiatement une erreur inline', () => {
    render(<InlineMessage tone="error" title="Synchronisation impossible" description="Réessayez dans un instant." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Synchronisation impossible')
    expect(screen.getByRole('alert')).toHaveClass('rounded-[12px]')
  })

  it('utilise un statut non urgent pour une information inline', () => {
    render(<InlineMessage title="Données mises à jour" />)
    expect(screen.getByRole('status')).toHaveTextContent('Données mises à jour')
  })

  it('conserve Premium sur une surface neutre avec une action explicite', () => {
    const onClick = vi.fn()
    render(<Banner tone="premium" title="Gagnez du temps" description="Automatisez les rappels." action={{ label: 'Découvrir', onClick }} />)
    const banner = screen.getByRole('complementary', { name: 'Gagnez du temps' })
    expect(banner).toHaveClass('bg-card', 'border-foreground/60')
    expect(screen.getByText('Premium')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Découvrir' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
