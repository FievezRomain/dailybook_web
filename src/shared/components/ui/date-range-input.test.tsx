import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DateRangeInput } from './date-range-input'

describe('DateRangeInput', () => {
  it('ouvre les deux calendriers et applique le raccourci de sept jours', () => {
    const onValueChange = vi.fn()
    render(<DateRangeInput value={{ from: undefined }} onValueChange={onValueChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Plage de dates' }))
    expect(screen.getByRole('dialog', { name: 'Sélectionner plage de dates' })).toBeInTheDocument()
    expect(screen.getAllByRole('grid')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: '7 jours' }))

    const range = onValueChange.mock.calls[0][0]
    expect(Math.round((range.to.getTime() - range.from.getTime()) / 86_400_000)).toBe(6)
  })

  it('annonce une plage chronologiquement invalide', () => {
    render(<DateRangeInput value={{ from: new Date(2026, 8, 20), to: new Date(2026, 8, 15) }} onValueChange={vi.fn()} size="comfortable" />)

    const trigger = screen.getByRole('button', { name: 'Plage de dates' })
    expect(trigger).toHaveAttribute('data-invalid', 'true')
    expect(trigger).toHaveClass('h-[52px]')
    fireEvent.click(trigger)
    expect(screen.getByRole('alert')).toHaveTextContent('La date de fin doit être postérieure')
  })
})
