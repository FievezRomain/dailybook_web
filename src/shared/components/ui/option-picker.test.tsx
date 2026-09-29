import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Combobox, MultiSelect } from './option-picker'

const animals = [{ value: 'cheval', label: 'Cheval' }, { value: 'poney', label: 'Poney' }]

describe('Option pickers', () => {
  it('filtre et sélectionne une valeur de Combobox', () => {
    const onValueChange = vi.fn()
    render(<Combobox label="Animal" options={animals} onValueChange={onValueChange} placeholder="Choisir un animal" />)

    const combobox = screen.getByRole('combobox', { name: 'Animal' })
    fireEvent.focus(combobox)
    fireEvent.change(combobox, { target: { value: 'pon' } })
    expect(screen.queryByRole('option', { name: 'Cheval' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('option', { name: 'Poney' }))
    expect(onValueChange).toHaveBeenCalledWith('poney')
  })

  it('permet de choisir une option au clavier', () => {
    const onValueChange = vi.fn()
    render(<Combobox label="Animal" options={animals} onValueChange={onValueChange} />)

    const combobox = screen.getByRole('combobox', { name: 'Animal' })
    fireEvent.focus(combobox)
    fireEvent.keyDown(combobox, { key: 'ArrowDown' })
    fireEvent.keyDown(combobox, { key: 'Enter' })
    expect(onValueChange).toHaveBeenCalledWith('poney')
  })

  it('conserve plusieurs valeurs et expose une listbox multisélection', () => {
    const onValueChange = vi.fn()
    render(<MultiSelect label="Animaux" options={animals} value={['cheval']} onValueChange={onValueChange} />)

    fireEvent.click(screen.getByRole('combobox', { name: 'Animaux' }))
    expect(screen.getByRole('listbox', { name: 'Animaux disponibles' })).toHaveAttribute('aria-multiselectable', 'true')
    fireEvent.click(screen.getByRole('option', { name: 'Poney' }))
    expect(onValueChange).toHaveBeenCalledWith(['cheval', 'poney'])
  })

  it('affiche les sélections sous forme de chips et résume le dépassement', () => {
    const options = [...animals, { value: 'ane', label: 'Âne' }]
    const onValueChange = vi.fn()
    render(<MultiSelect label="Animaux" options={options} value={['cheval', 'poney', 'ane']} onValueChange={onValueChange} size="comfortable" />)

    fireEvent.click(screen.getByRole('button', { name: 'Retirer Cheval' }))
    expect(onValueChange).toHaveBeenCalledWith(['poney', 'ane'])
    expect(screen.getByText('+1')).toBeInTheDocument()
    expect(screen.getByLabelText('3 sélections')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Animaux' }).parentElement).toHaveClass('h-[52px]')
  })
})
