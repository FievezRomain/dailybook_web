'use client'

import * as React from 'react'
import { Check, Search, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from './button'

type OptionPickerOption = { value: string; label: string; disabled?: boolean }
type PickerSize = 'compact' | 'comfortable'
type CommonProps = { className?: string; disabled?: boolean; emptyLabel?: string; label: string; options: OptionPickerOption[]; placeholder?: string; size?: PickerSize }

const fieldSize = { compact: 'h-10', comfortable: 'h-12' } satisfies Record<PickerSize, string>
const multiFieldSize = { compact: 'h-11', comfortable: 'h-[52px]' } satisfies Record<PickerSize, string>

function OptionList({ activeIndex, id, label, multiple = false, onChoose, options, selectedValues }: { activeIndex: number; id: string; label: string; multiple?: boolean; onChoose: (value: string) => void; options: OptionPickerOption[]; selectedValues: string[] }) {
  return <div id={id} role="listbox" aria-label={`${label} disponibles`} aria-multiselectable={multiple || undefined} className="grid max-h-56 gap-1 overflow-y-auto">
    <p className="sr-only" aria-live="polite">{options.length} résultat{options.length === 1 ? '' : 's'}</p>
    {options.map((option, index) => { const selected = selectedValues.includes(option.value); return <button key={option.value} id={`${id}-${option.value}`} role="option" type="button" aria-selected={selected} disabled={option.disabled} onMouseDown={(event) => event.preventDefault()} onClick={() => onChoose(option.value)} className={cn('flex h-9 w-full items-center justify-between gap-3 rounded-control px-2.5 text-left text-xs outline-none hover:bg-accent focus-visible:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50', index === activeIndex && 'bg-accent')}><span>{option.label}</span>{selected && <Check aria-label="Sélectionné" className="size-4 text-primary" />}</button> })}
  </div>
}

function Combobox({ className, disabled = false, emptyLabel = 'Aucun résultat.', label, onValueChange, options, placeholder = 'Choisir une option', size = 'compact', value }: CommonProps & { onValueChange: (value: string | undefined) => void; value?: string }) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [activeIndex, setActiveIndex] = React.useState(0)
  const id = React.useId()
  const selected = options.find((option) => option.value === value)
  const results = options.filter((option) => option.label.toLocaleLowerCase('fr-FR').includes(query.toLocaleLowerCase('fr-FR')))
  const choose = (nextValue: string) => { onValueChange(nextValue); setOpen(false); setQuery('') }

  return <div data-slot="combobox" className={cn('relative', className)}>
    <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 z-10 size-[18px] -translate-y-1/2 text-muted-foreground" />
    <input role="combobox" aria-label={label} aria-autocomplete="list" aria-controls={open ? id : undefined} aria-expanded={open} aria-activedescendant={open && results[activeIndex] ? `${id}-${results[activeIndex].value}` : undefined} disabled={disabled} value={open ? query : selected?.label ?? ''} placeholder={placeholder} onFocus={() => { setActiveIndex(0); setOpen(true) }} onChange={(event) => { setActiveIndex(0); setQuery(event.target.value); setOpen(true) }} onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); setActiveIndex((current) => Math.min(current + 1, Math.max(results.length - 1, 0))) } if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((current) => Math.max(current - 1, 0)) } if (event.key === 'Enter' && open && results[activeIndex] && !results[activeIndex].disabled) { event.preventDefault(); choose(results[activeIndex].value) } }} className={cn('w-full rounded-surface border border-foreground/60 bg-card py-0 pl-10 pr-14 text-[13px] outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus:border-ring focus:ring-[3px] focus:ring-ring/50 disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground', fieldSize[size])} />
    <kbd aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">⌘K</kbd>
    {open && <div className="absolute z-50 mt-2 w-full min-w-64 rounded-overlay border bg-popover p-2 text-popover-foreground shadow-overlay">{results.length ? <OptionList id={id} label={label} options={results} activeIndex={activeIndex} selectedValues={value ? [value] : []} onChoose={choose} /> : <p id={id} role="listbox" aria-label={`${label} disponibles`} className="p-1 text-xs text-muted-foreground">{emptyLabel}</p>}</div>}
  </div>
}

function MultiSelect({ className, disabled = false, emptyLabel = 'Aucun résultat.', label, onValueChange, options, placeholder = 'Choisir une ou plusieurs options', size = 'compact', value }: CommonProps & { onValueChange: (value: string[]) => void; value: string[] }) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [activeIndex, setActiveIndex] = React.useState(0)
  const id = React.useId()
  const selected = options.filter((option) => value.includes(option.value))
  const visible = selected.slice(0, 2)
  const overflow = Math.max(selected.length - visible.length, 0)
  const results = options.filter((option) => option.label.toLocaleLowerCase('fr-FR').includes(query.toLocaleLowerCase('fr-FR')))
  const toggle = (nextValue: string) => onValueChange(value.includes(nextValue) ? value.filter((item) => item !== nextValue) : [...value, nextValue])

  return <div data-slot="multi-select" className={cn('relative', className)}>
    <div className={cn('flex w-full items-center gap-1.5 rounded-surface border border-foreground/60 bg-card px-2.5 transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50', multiFieldSize[size], disabled && 'cursor-not-allowed border-border bg-muted text-muted-foreground')}>
      {visible.map((option) => <button key={option.value} type="button" disabled={disabled} aria-label={`Retirer ${option.label}`} onClick={() => toggle(option.value)} className="flex shrink-0 items-center gap-1 rounded-[9px] bg-muted px-2 py-1 text-[11px] font-bold text-primary outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">{option.label}<X aria-hidden="true" className="size-3 text-muted-foreground" /></button>)}
      {overflow > 0 && <span className="flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-primary text-[11px] font-bold text-primary-foreground">+{overflow}</span>}
      <button type="button" disabled={disabled} role="combobox" aria-label={label} aria-controls={open ? id : undefined} aria-expanded={open} aria-haspopup="listbox" onClick={() => { setQuery(''); setActiveIndex(0); setOpen((current) => !current) }} className="flex min-w-0 flex-1 items-center overflow-hidden text-left text-[13px] outline-none">
        {!selected.length ? <span className="truncate text-muted-foreground">{placeholder}</span> : <span className="sr-only">Modifier la sélection</span>}
      </button>
      <span aria-label={`${value.length} sélection${value.length === 1 ? '' : 's'}`} className="flex size-7 shrink-0 items-center justify-center rounded-[10px] bg-muted text-[11px] font-bold text-primary">{value.length}</span>
    </div>
    {open && <div className="absolute z-50 mt-2 w-full min-w-64 rounded-overlay border bg-popover p-2 shadow-overlay">
      <label className="relative mb-1 block"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Rechercher {label}</span><input autoFocus value={query} onChange={(event) => { setActiveIndex(0); setQuery(event.target.value) }} onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((current) => Math.min(current + 1, Math.max(results.length - 1, 0))) } if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((current) => Math.max(current - 1, 0)) } if (event.key === 'Enter' && results[activeIndex] && !results[activeIndex].disabled) { event.preventDefault(); toggle(results[activeIndex].value) } }} className="h-9 w-full rounded-control border bg-transparent py-1 pr-3 pl-9 text-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" placeholder="Rechercher…" /></label>
      {results.length ? <OptionList id={id} label={label} multiple options={results} activeIndex={activeIndex} selectedValues={value} onChoose={toggle} /> : <p id={id} role="listbox" aria-label={`${label} disponibles`} className="px-2.5 py-2 text-xs text-muted-foreground">{emptyLabel}</p>}
      <Button type="button" size="sm" className="mt-2 w-full" onClick={() => setOpen(false)}>Terminer</Button>
    </div>}
  </div>
}

export { Combobox, MultiSelect, type OptionPickerOption, type PickerSize }
