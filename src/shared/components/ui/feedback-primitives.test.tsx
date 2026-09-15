import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ProgressDisplay } from './progress'
import { SkeletonPattern } from './skeleton'
import { Spinner } from './spinner'

describe('feedbacks de chargement Vasco', () => {
  it('dimensionne le spinner et conserve un libellé visible pour une attente longue', () => {
    render(<Spinner size="large" tone="neutral" label="Synchronisation en cours" />)
    expect(screen.getByRole('status')).toHaveTextContent('Synchronisation en cours')
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('size-8', 'motion-reduce:animate-none')
  })

  it('rend les trois structures Skeleton sans les annoncer', () => {
    const { container, rerender } = render(<SkeletonPattern type="text" density="comfortable" />)
    expect(container.querySelector('[data-slot="skeleton-pattern"]')).toHaveAttribute('aria-hidden', 'true')
    rerender(<SkeletonPattern type="card" />)
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(3)
    rerender(<SkeletonPattern type="avatar-row" density="comfortable" />)
    expect(container.querySelector('[data-slot="skeleton"].size-12')).toBeInTheDocument()
  })

  it('annonce valeur, complétion et erreur sans dépendre de la couleur', () => {
    const { rerender } = render(<ProgressDisplay value={64} label="Import en cours" />)
    expect(screen.getByRole('progressbar', { name: 'Import en cours' })).toHaveAttribute('aria-valuetext', '64 %')
    rerender(<ProgressDisplay variant="circular" status="complete" label="Import" />)
    expect(screen.getByRole('progressbar', { name: 'Import' })).toHaveAttribute('aria-valuenow', '100')
    expect(screen.getByText('Terminé')).toBeInTheDocument()
    rerender(<ProgressDisplay variant="circular" status="error" label="Import" value={68} />)
    expect(screen.getByRole('progressbar', { name: 'Import' })).toHaveAttribute('aria-valuetext', 'Erreur')
    expect(screen.getByText('Réessayer')).toBeInTheDocument()
  })
})
