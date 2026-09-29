import * as React from 'react'

import { cn } from '@/lib/utils'

export type AlphabeticalGroup<T> = {
  letter: string
  items: T[]
}

export function getDirectoryInitial(value: string) {
  const first = value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').charAt(0).toLocaleUpperCase('fr-FR')
  return /^[A-Z]$/.test(first) ? first : '#'
}

export function groupAlphabetically<T>(items: readonly T[], getLabel: (item: T) => string): AlphabeticalGroup<T>[] {
  const collator = new Intl.Collator('fr', { sensitivity: 'base' })
  const sorted = [...items].sort((left, right) => collator.compare(getLabel(left), getLabel(right)))
  const groups = new Map<string, T[]>()

  for (const item of sorted) {
    const letter = getDirectoryInitial(getLabel(item))
    groups.set(letter, [...(groups.get(letter) ?? []), item])
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left === '#' ? 1 : right === '#' ? -1 : collator.compare(left, right))
    .map(([letter, groupedItems]) => ({ letter, items: groupedItems }))
}

export function AlphabeticalDirectory<T>({
  groups,
  getKey,
  renderItem,
  label = 'Répertoire alphabétique',
  className,
}: {
  groups: readonly AlphabeticalGroup<T>[]
  getKey: (item: T) => React.Key
  renderItem: (item: T) => React.ReactNode
  label?: string
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-[minmax(0,1fr)_2rem] gap-3', className)}>
      <div className="min-w-0 space-y-6" aria-label={label}>
        {groups.map((group) => (
          <section key={group.letter} id={`directory-${group.letter}`} aria-labelledby={`directory-heading-${group.letter}`} className="scroll-mt-4">
            <h2 id={`directory-heading-${group.letter}`} className="sticky top-0 z-10 border-b bg-background/95 py-1 text-sm font-bold text-primary backdrop-blur">
              {group.letter}
            </h2>
            <div className="divide-y">{group.items.map((item) => <React.Fragment key={getKey(item)}>{renderItem(item)}</React.Fragment>)}</div>
          </section>
        ))}
      </div>
      <nav aria-label="Index alphabétique" className="sticky top-4 self-start">
        <ol className="grid justify-items-center gap-0.5">
          {groups.map((group) => (
            <li key={group.letter}>
              <a className="grid size-7 place-items-center rounded-full text-xs font-bold text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50" href={`#directory-${group.letter}`} aria-label={`Aller aux contacts ${group.letter}`}>
                {group.letter}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
