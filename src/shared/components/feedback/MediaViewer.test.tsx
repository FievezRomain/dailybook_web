import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/security/presigned-url', () => ({ openPresignedUrl: vi.fn() }))

import { MediaViewer } from './MediaViewer'

describe('MediaViewer', () => {
  it('prévisualise une image avec un libellé explicite', () => {
    render(<MediaViewer open fileName="documents/bilan.png" url="https://storage.example.test/bilan.png" onOpenChange={vi.fn()} />)
    expect(screen.getByRole('img', { name: 'Aperçu de bilan.png' })).toHaveAttribute('src', 'https://storage.example.test/bilan.png')
    expect(screen.getByRole('button', { name: 'Télécharger' })).toBeEnabled()
  })

  it('prévisualise un PDF et délègue sa fermeture au contrôleur', () => {
    const onOpenChange = vi.fn()
    render(<MediaViewer open fileName="bilan.pdf" url="https://storage.example.test/bilan.pdf" onOpenChange={onOpenChange} />)
    expect(screen.getByTitle('Aperçu de bilan.pdf')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Fermer l’aperçu' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
