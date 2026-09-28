'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

import type { Animal } from '@/features/animals/types/animal'
import { cn } from '@/lib/utils'
import { Card } from '@/shared/components/ui/card'
import type { ImageSigned } from '@/types/image'

import type { EventStatistics } from '../types/statistics'
import { ExpenseEventCards } from './ExpenseEventCards'

function itemKey(item: EventStatistics['statistic'][number], index: number) {
  return `${item.name ?? 'resultat'}-${index}`
}

function itemValue(item: EventStatistics['statistic'][number]) {
  return item.exact_value ?? item.value
}

function formatValue(value?: number | null) {
  if (value === undefined || value === null) return '—'
  return `${value.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`
}

export function ExpenseBreakdown({
  animals,
  onUpdateAnimalImage,
  result,
}: {
  animals: Animal[]
  onUpdateAnimalImage: (id: number, image: ImageSigned) => void
  result: EventStatistics
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const selectedIndex = result.statistic.findIndex((item, index) => itemKey(item, index) === selectedKey)
  const selectedItem = selectedIndex >= 0 ? result.statistic[selectedIndex] : undefined
  const selectedLabel = selectedItem?.name || 'Résultat'

  return (
    <div className="space-y-5">
      <Card className="gap-0 overflow-hidden rounded-[24px] p-0 shadow-surface">
        <header className="border-b bg-muted/20 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">Données sources</p>
          <h2 className="mt-1 text-lg font-semibold">Valeurs exactes</h2>
          <p className="mt-1 text-xs text-muted-foreground">Sélectionnez une catégorie pour consulter les événements correspondants.</p>
        </header>
        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[520px] text-left text-sm">
            <caption className="sr-only">Valeurs détaillées des dépenses par catégorie</caption>
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">Catégorie</th>
                <th className="px-3 py-2 font-medium">Nombre</th>
                <th className="px-3 py-2 text-right font-medium">Valeur exacte</th>
              </tr>
            </thead>
            <tbody>
              {result.statistic.map((item, index) => {
                const key = itemKey(item, index)
                const selected = key === selectedKey
                return (
                  <tr key={key} className={cn('border-b transition-colors last:border-0', selected && 'bg-primary/[0.06]')}>
                    <td className="p-0">
                      <button
                        type="button"
                        aria-pressed={selected}
                        className="flex min-h-12 w-full cursor-pointer items-center gap-2 rounded-control px-3 py-3 text-left font-semibold text-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => setSelectedKey(key)}
                      >
                        <ChevronRight className={cn('size-4 shrink-0 text-primary transition-transform', selected && 'rotate-90')} aria-hidden="true" />
                        <span>{item.name || 'Résultat'}</span>
                      </button>
                    </td>
                    <td className="px-3 py-3 tabular-nums">{item.count ?? item.events.length}</td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums">{formatValue(itemValue(item))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedItem ? (
        <ExpenseEventCards
          result={{ statistic: [selectedItem] }}
          animals={animals}
          onUpdateAnimalImage={onUpdateAnimalImage}
          title={`Événements · ${selectedLabel}`}
          description="Événements rattachés à la catégorie sélectionnée."
        />
      ) : (
        <p className="rounded-[18px] border border-dashed bg-muted/15 px-4 py-5 text-center text-sm text-muted-foreground">
          Choisissez une catégorie dans le tableau pour afficher ses événements.
        </p>
      )}
    </div>
  )
}
