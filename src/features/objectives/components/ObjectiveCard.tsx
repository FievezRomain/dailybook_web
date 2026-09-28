import { CalendarDays, CheckCircle2, Clock3, MoreHorizontal, Target } from 'lucide-react'

import { AnimalAvatar } from '@/features/animals/components/AnimalAvatar'
import type { Animal } from '@/features/animals/types/animal'
import type { Objective } from '@/features/objectives/types/objective'
import { cn } from '@/lib/utils'
import { CustomCheckbox } from '@/shared/components/forms/CustomCheckbox'
import { IconButton } from '@/shared/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu'
import { Progress } from '@/shared/components/ui/progress'
import type { ImageSigned } from '@/types/image'

type ObjectiveCardProps = {
  objective: Objective
  animals: Animal[]
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onDuplicate: (id: number) => void
  onComplete: (objectiveId: number, stepId: number, objective: Objective) => void
  onUpdateAnimalImage: (id: number, imageObj: ImageSigned) => void
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function periodLabel(objective: Objective) {
  if (objective.datedebut && objective.datefin) return `${formatDate(objective.datedebut)} — ${formatDate(objective.datefin)}`
  if (objective.datedebut) return `Depuis le ${formatDate(objective.datedebut)}`
  if (objective.datefin) return `Avant le ${formatDate(objective.datefin)}`
  return 'Sans échéance'
}

function deadlineLabel(date?: string) {
  if (!date) return null
  const target = new Date(`${date}T23:59:59`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.ceil((target.getTime() - today.getTime()) / 86_400_000)
  if (days < 0) return { label: `Échéance dépassée de ${Math.abs(days)} j`, urgent: true }
  if (days === 0) return { label: 'Échéance aujourd’hui', urgent: true }
  if (days <= 7) return { label: `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`, urgent: true }
  return { label: `${days} jours restants`, urgent: false }
}

export function ObjectiveCard({ objective, animals, onEdit, onDelete, onDuplicate, onComplete, onUpdateAnimalImage }: ObjectiveCardProps) {
  const steps = [...objective.sousetapes].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).filter((step) => typeof step.id === 'number')
  const completedSteps = steps.filter((step) => step.state).length
  const progress = steps.length ? Math.round((completedSteps / steps.length) * 100) : 0
  const complete = steps.length > 0 && progress === 100
  const deadline = complete ? null : deadlineLabel(objective.datefin)
  const temporality = objective.temporalityobjectif?.trim()
  const footerLabel = temporality && temporality.toLowerCase() !== 'tobedelete'
    ? temporality
    : `${steps.length} étape${steps.length > 1 ? 's' : ''}`

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-border/70 bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-surface motion-reduce:transform-none">
      <div aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-1', complete ? 'bg-bai-cerise' : 'bg-gradient-to-r from-primary via-bai-cerise to-alezan')} />
      <header className="flex items-start gap-3 px-5 pb-4 pt-5">
        <span className={cn('grid size-11 shrink-0 place-items-center rounded-[15px]', complete ? 'bg-palomino/70 text-bai-brun dark:bg-baie/30 dark:text-palomino' : 'bg-primary/10 text-primary')}>
          {complete ? <CheckCircle2 className="size-5" aria-hidden="true" /> : <Target className="size-5" aria-hidden="true" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><span className={cn('rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide', complete ? 'bg-palomino/70 text-bai-brun dark:bg-baie/30 dark:text-palomino' : 'bg-primary/10 text-primary')}>{complete ? 'Objectif atteint' : 'En progression'}</span>{deadline && <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium', deadline.urgent ? 'text-warning' : 'text-muted-foreground')}><Clock3 className="size-3" aria-hidden="true" />{deadline.label}</span>}</div>
          <h4 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug tracking-[-0.02em]">{objective.title}</h4>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="size-3.5" aria-hidden="true" />{periodLabel(objective)}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><IconButton size="compact" label={`Options pour ${objective.title}`}><MoreHorizontal aria-hidden="true" /></IconButton></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(objective.id)}>Modifier</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(objective.id)}>Dupliquer</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(objective.id)}>Supprimer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="mx-5 rounded-[18px] bg-muted/40 p-4">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Progression</p><p className="mt-1 text-xs text-muted-foreground">{completedSteps} étape{completedSteps > 1 ? 's' : ''} sur {steps.length}</p></div>
          <strong className={cn('text-2xl tracking-[-0.04em] tabular-nums', complete ? 'text-bai-cerise' : 'text-primary')}>{progress}%</strong>
        </div>
        <Progress value={progress} className="h-2" aria-label={`Progression : ${progress} pour cent`} />
      </div>

      {steps.length > 0 && (
        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">Étapes</p>
          <div className="mt-2 space-y-2">
            {steps.map((step) => (
              <label
                key={step.id}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-[16px] border p-3 transition-colors',
                  step.state
                    ? 'border-isabelle/60 bg-palomino/25 hover:bg-palomino/40 dark:border-isabelle/30 dark:bg-baie/10 dark:hover:bg-baie/20'
                    : 'border-primary/15 bg-primary/[0.04] hover:bg-primary/[0.07]',
                )}
              >
                <CustomCheckbox checked={step.state} onChange={() => onComplete(objective.id, step.id, objective)} />
                <span className="min-w-0 flex-1 text-sm font-medium leading-5">{step.etape}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <footer className="mt-auto flex min-h-14 items-center justify-between gap-3 border-t border-border/60 px-5 py-3">
        <div>{animals.length ? <><p className="sr-only">Animaux concernés</p><div className={cn('flex items-center', animals.length === 1 ? 'gap-2' : '-space-x-2')}>{animals.length === 1 ? <><AnimalAvatar animal={animals[0]} onUpdateAnimalImage={onUpdateAnimalImage} width={32} height={32} classNames="rounded-full border-2 border-card" /><span className="max-w-36 truncate text-xs font-medium text-muted-foreground">{animals[0].nom || 'Animal'}</span></> : <>{animals.slice(0, 4).map((animal) => <AnimalAvatar key={animal.id} animal={animal} onUpdateAnimalImage={onUpdateAnimalImage} width={32} height={32} classNames="rounded-full border-2 border-card" />)}{animals.length > 4 && <span className="grid size-8 place-items-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold">+{animals.length - 4}</span>}</>}</div></> : <span className="text-xs text-muted-foreground">Objectif général</span>}</div>
        <span className="text-xs font-medium text-muted-foreground">{footerLabel}</span>
      </footer>
    </article>
  )
}
