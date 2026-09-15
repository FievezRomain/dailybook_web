import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CustomCheckbox } from './CustomCheckbox'

describe('CustomCheckbox', () => {
  it('expose une case à cocher et respecte disabled', () => {
    const onChange = vi.fn()
    const { rerender } = render(<CustomCheckbox checked={false} onChange={onChange} />)

    const checkbox = screen.getByRole('checkbox', { name: 'Marquer comme complété' })
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
    fireEvent.click(checkbox)
    expect(onChange).toHaveBeenCalledOnce()

    rerender(<CustomCheckbox checked onChange={onChange} disabled label="Terminer l’objectif" />)
    expect(screen.getByRole('checkbox', { name: 'Terminer l’objectif' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('checkbox', { name: 'Terminer l’objectif' })).toBeDisabled()
  })
})
