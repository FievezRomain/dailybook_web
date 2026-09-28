import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { RecurrenceScopeSelector } from './RecurrenceScopeSelector'

describe('RecurrenceScopeSelector', () => {
  it('expose les trois portées avec leurs conséquences et sélectionne la portée demandée', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<RecurrenceScopeSelector value="occurrence" onChange={onChange} />)

    expect(screen.getByText('Uniquement l’événement sélectionné.')).toBeVisible()
    expect(screen.getByText('Toutes les occurrences, passées et futures.')).toBeVisible()
    await user.click(screen.getByRole('radio', { name: /Cette occurrence et les suivantes/ }))
    expect(onChange).toHaveBeenCalledWith('following')
  })
})
