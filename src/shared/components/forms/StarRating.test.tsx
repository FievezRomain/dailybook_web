import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StarRating } from './StarRating'

describe('StarRating', () => {
  it('utilise des boutons accessibles et permet de retirer la note courante', () => {
    const onChange = vi.fn()
    render(<StarRating label="Évaluation" value={3} onChange={onChange} />)

    const thirdStar = screen.getByRole('button', { name: 'Attribuer 3 étoiles' })
    expect(thirdStar).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(thirdStar)
    expect(onChange).toHaveBeenCalledWith(0)
  })
})
