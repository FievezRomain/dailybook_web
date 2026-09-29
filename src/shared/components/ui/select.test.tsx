import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

describe('Select', () => {
  it('expose un combobox ouvert, son option sélectionnée et son erreur', () => {
    render(
      <Select open defaultValue="cheval">
        <SelectTrigger aria-label="Animal" aria-invalid="true"><SelectValue placeholder="Choisir un animal" /></SelectTrigger>
        <SelectContent><SelectItem value="cheval">Cheval</SelectItem><SelectItem value="poney">Poney</SelectItem></SelectContent>
      </Select>,
    )

    const combobox = screen.getByRole('combobox', { name: 'Animal', hidden: true })
    expect(combobox).toHaveAttribute('aria-expanded', 'true')
    expect(combobox).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('option', { name: 'Cheval' })).toHaveAttribute('data-state', 'checked')
    expect(screen.getByRole('option', { name: 'Cheval' })).toHaveClass('cursor-pointer')
  })

  it('ne permet pas l’ouverture lorsqu’il est désactivé', () => {
    render(<Select><SelectTrigger aria-label="Animal indisponible" disabled><SelectValue placeholder="Choisir" /></SelectTrigger></Select>)
    expect(screen.getByRole('combobox', { name: 'Animal indisponible' })).toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Animal indisponible' })).toHaveClass('disabled:cursor-not-allowed')
  })

  it('propose les hauteurs Compact et Comfortable de Figma', () => {
    const { rerender } = render(<Select><SelectTrigger aria-label="Format" size="compact"><SelectValue placeholder="Choisir" /></SelectTrigger></Select>)
    expect(screen.getByRole('combobox', { name: 'Format' })).toHaveAttribute('data-size', 'compact')

    rerender(<Select><SelectTrigger aria-label="Format" size="comfortable"><SelectValue placeholder="Choisir" /></SelectTrigger></Select>)
    expect(screen.getByRole('combobox', { name: 'Format' })).toHaveAttribute('data-size', 'comfortable')
  })
})
