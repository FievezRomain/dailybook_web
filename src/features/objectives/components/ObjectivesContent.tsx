'use client'

import { useMemo, useState } from 'react'
import { Check, CheckCircle2, Target } from 'lucide-react'

import { AnimalSelector } from '@/features/animals/components/AnimalSelector'
import { useAnimalsQuery } from '@/features/animals/hooks/use-animals'
import { useObjectivesQuery } from '@/features/objectives/hooks/use-objectives'
import type { Objective } from '@/features/objectives/types/objective'
import { cn } from '@/lib/utils'
import { PageShell } from '@/shared/components/layout/PageShell'
import { Banner } from '@/shared/components/ui/message'
import { Skeleton } from '@/shared/components/ui/skeleton'

import { ObjectiveList } from './ObjectiveList'

type ObjectiveStatus = 'ongoing' | 'completed'

function isCompleted(objective: Objective) {
  return objective.sousetapes.length > 0 && objective.sousetapes.every((step) => step.state)
}

export default function ObjectivesContent() {
  const { objectives = [], isLoading, isError, refetch } = useObjectivesQuery()
  const animalsQuery = useAnimalsQuery()
  const animals = animalsQuery.animals ?? []
  const [status, setStatus] = useState<ObjectiveStatus>('ongoing')
  const [selectedAnimals, setSelectedAnimals] = useState<number[]>([])

  const overview = useMemo(() => {
    const completed = objectives.filter(isCompleted).length
    return {
      active: objectives.length - completed,
      completed,
    }
  }, [objectives])

  const filtered = useMemo(() => objectives.filter((objective) => {
    if ((status === 'completed') !== isCompleted(objective)) return false
    return selectedAnimals.length === 0 || objective.animaux.some((id) => selectedAnimals.includes(id))
  }), [objectives, selectedAnimals, status])

  const filterLabel = selectedAnimals.length === 0
    ? 'Tous les animaux'
    : selectedAnimals.length === 1
      ? '1 animal'
      : `${selectedAnimals.length} animaux`

  return (
    <PageShell className="space-y-6 pb-24">
      {animalsQuery.isLoading ? <Skeleton className="h-24 rounded-[20px]" /> : animals.length ? (
        <section className="rounded-[22px] border bg-card px-4 py-3 shadow-sm sm:px-5" aria-label="Filtrer les objectifs par animal">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" aria-pressed={selectedAnimals.length === 0} onClick={() => setSelectedAnimals([])} className={cn('grid min-h-14 shrink-0 place-items-center rounded-[16px] border px-4 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', selectedAnimals.length === 0 ? 'border-primary/30 bg-primary/10 text-primary' : 'border-transparent bg-muted/40 text-muted-foreground hover:text-foreground')}>
              <span className="inline-flex items-center gap-2"><Target className="size-4" aria-hidden="true" />Tous</span>
              <span className="font-normal">{objectives.length} objectif{objectives.length > 1 ? 's' : ''}</span>
            </button>
            <div className="min-w-0 flex-1"><AnimalSelector animals={animals} selectedIds={selectedAnimals} onChange={setSelectedAnimals} onUpdateAnimalImage={animalsQuery.updateAnimalImage} /></div>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="objective-list-heading" className="space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{filterLabel}</p>
            <h3 id="objective-list-heading" className="mt-1 text-2xl font-semibold tracking-[-0.02em]">{status === 'ongoing' ? 'Objectifs en cours' : 'Objectifs terminés'}</h3>
          </div>
          <div className="inline-flex rounded-[14px] bg-muted/60 p-1" role="tablist" aria-label="État des objectifs">
            {([['ongoing', 'En cours', overview.active], ['completed', 'Terminés', overview.completed]] as const).map(([value, label, count]) => (
              <button key={value} type="button" role="tab" aria-selected={status === value} onClick={() => setStatus(value)} className={cn('inline-flex min-h-10 items-center gap-2 rounded-[11px] px-4 text-sm font-semibold text-muted-foreground transition-[background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', status === value && 'bg-card text-foreground shadow-sm')}>
                {status === value && <Check className="size-4 text-primary" aria-hidden="true" />}{label}<span className="rounded-full bg-muted px-2 py-0.5 text-[11px] tabular-nums">{count}</span>
              </button>
            ))}
          </div>
        </header>

        {isLoading ? <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-80 rounded-[24px]" />)}</div> : isError ? (
          <Banner tone="warning" title="Les objectifs n’ont pas pu être chargés" description="Vos données existantes restent inchangées." action={{ label: 'Réessayer', onClick: () => void refetch() }} />
        ) : filtered.length ? <ObjectiveList objectives={filtered} /> : (
          <div className="relative flex min-h-64 flex-col items-center justify-center overflow-hidden rounded-[24px] border border-dashed bg-muted/15 p-6 text-center">
            <div aria-hidden="true" className="absolute -bottom-20 size-64 rounded-full bg-primary/5 blur-3xl" />
            {status === 'completed' ? <CheckCircle2 className="relative mb-3 size-9 text-muted-foreground" aria-hidden="true" /> : <Target className="relative mb-3 size-9 text-muted-foreground" aria-hidden="true" />}
            <h3 className="relative text-lg font-semibold">{selectedAnimals.length ? 'Aucun objectif pour cette sélection' : status === 'completed' ? 'Aucun objectif terminé' : 'Aucun objectif en cours'}</h3>
            <p className="relative mt-2 max-w-md text-sm leading-6 text-muted-foreground">{selectedAnimals.length ? 'Choisissez un autre animal ou revenez à tous les objectifs.' : 'Utilisez l’action Créer du menu principal pour définir votre prochain cap.'}</p>
          </div>
        )}
      </section>
    </PageShell>
  )
}
