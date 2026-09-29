import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PremiumComparison, PremiumNotice } from './premium'
import { SystemState } from './system-state'

describe('états système et Premium Vasco', () => {
  it('explique une erreur, préserve les modifications locales et propose une action sûre', () => {
    const retry = vi.fn()
    render(<SystemState state="error" density="page" primaryAction={{ label: 'Réessayer', onClick: retry }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Vos modifications locales sont conservées')
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it('présente le hors-ligne comme un statut non destructif', () => {
    render(<SystemState state="offline" />)
    expect(screen.getByRole('status')).toHaveTextContent('consulter les données déjà chargées')
  })

  it('garde la notice Premium neutre et dismissible', () => {
    const dismiss = vi.fn()
    render(<PremiumNotice action="dismiss" context="card" title="Fonctionnalité Premium" description="Cette fonction nécessite Premium." onAction={dismiss} />)
    const notice = screen.getByRole('complementary', { name: 'Fonctionnalité Premium · Premium' })
    expect(notice).toHaveClass('bg-card', 'border-foreground/60', 'max-w-[380px]')
    fireEvent.click(screen.getByRole('button', { name: 'Masquer' }))
    expect(dismiss).toHaveBeenCalledOnce()
  })

  it('compare Essentiel et Premium ligne par ligne avec un CTA unique', () => {
    render(<PremiumComparison layout="wide" premiumAction={<button type="button">Choisir Premium</button>} />)
    const comparison = screen.getByLabelText('Comparatif des abonnements')
    expect(comparison).toHaveClass('max-w-[820px]')
    expect(screen.getByRole('rowheader', { name: 'Automatisations' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Choisir Premium' })).toBeInTheDocument()
  })
})
