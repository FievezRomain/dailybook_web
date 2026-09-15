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
  const nextStep = steps.find((step) => !step.state)
  const deadline = complete ? null : deadlineLabel(objective.datefin)

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-border/70 bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-surface motion-reduce:transform-none">
      <div aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-1', complete ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary via-[#b07165] to-[#ce9871]')} />
      <header className="flex items-start gap-3 px-5 pb-4 pt-5">
        <span className={cn('grid size-11 shrink-0 place-items-center rounded-[15px]', complete ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary')}>
          {complete ? <CheckCircle2 className="size-5" aria-hidden="true" /> : <Target className="size-5" aria-hidden="true" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><span className={cn('rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide', complete ? 'bg-emerald-500/10 text-emerald-700' : 'bg-primary/10 text-primary')}>{complete ? 'Objectif atteint' : 'En progression'}</span>{deadline && <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium', deadline.urgent ? 'text-amber-700' : 'text-muted-foreground')}><Clock3 className="size-3" aria-hidden="true" />{deadline.label}</span>}</div>
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
          <strong className={cn('text-2xl tracking-[-0.04em] tabular-nums', complete ? 'text-emerald-600' : 'text-primary')}>{progress}%</strong>
        </div>
        <Progress value={progress} className="h-2" aria-label={`Progression : ${progress} pour cent`} />
      </div>

      {nextStep ? <div className="px-5 py-4"><p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">Prochaine étape</p><label className="mt-2 flex cursor-pointer items-start gap-3 rounded-[16px] border border-primary/15 bg-primary/[0.04] p-3 transition-colors hover:bg-primary/[0.07]"><CustomCheckbox checked={false} onChange={() => onComplete(objective.id, nextStep.id as number, objective)} /><span className="min-w-0 flex-1 text-sm font-medium leading-5">{nextStep.etape}</span></label>{steps.length - completedSteps > 1 && <p className="mt-2 pl-1 text-xs text-muted-foreground">Puis {steps.length - completedSteps - 1} autre{steps.length - completedSteps > 2 ? 's' : ''} étape{steps.length - completedSteps > 2 ? 's' : ''}</p>}</div> : steps.length ? <div className="px-5 py-4"><p className="flex items-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 className="size-4" aria-hidden="true" />Toutes les étapes sont accomplies</p></div> : null}

      <footer className="mt-auto flex min-h-14 items-center justify-between gap-3 border-t border-border/60 px-5 py-3">
        <div>{animals.length ? <><p className="sr-only">Animaux concernés</p><div className="flex -space-x-2">{animals.slice(0, 4).map((animal) => <AnimalAvatar key={animal.id} animal={animal} onUpdateAnimalImage={onUpdateAnimalImage} width={32} height={32} classNames="rounded-full border-2 border-card" />)}{animals.length > 4 && <span className="grid size-8 place-items-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold">+{animals.length - 4}</span>}</div></> : <span className="text-xs text-muted-foreground">Objectif général</span>}</div>
        <span className="text-xs font-medium text-muted-foreground">{objective.temporalityobjectif || `${steps.length} étape${steps.length > 1 ? 's' : ''}`}</span>
      </footer>
    </article>
  )
}
