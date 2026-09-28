import { FileText, RefreshCw, WifiOff } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from './button'

type SystemStateKind = 'empty' | 'error' | 'offline'
type StateAction = { label: string; onClick: () => void }

const defaults = {
  empty: { title: 'Rien à afficher pour le moment', description: 'Créez un premier élément ou modifiez les filtres appliqués.', primary: 'Ajouter', secondary: 'Réinitialiser', Icon: FileText },
  error: { title: 'Impossible de charger les données', description: 'Un problème inattendu est survenu. Vos modifications locales sont conservées.', primary: 'Réessayer', secondary: 'Signaler', Icon: RefreshCw },
  offline: { title: 'Vous êtes hors connexion', description: 'Vous pouvez continuer à consulter les données déjà chargées. La synchronisation reprendra automatiquement.', primary: 'Réessayer', secondary: 'Hors ligne', Icon: WifiOff },
} satisfies Record<SystemStateKind, { title: string; description: string; primary: string; secondary: string; Icon: typeof FileText }>

function SystemState({ className, density = 'compact', description, primaryAction, secondaryAction, state = 'empty', title }: { className?: string; density?: 'compact' | 'page'; description?: string; primaryAction?: StateAction; secondaryAction?: StateAction; state?: SystemStateKind; title?: string }) {
  const content = defaults[state]
  const Icon = content.Icon
  const page = density === 'page'
  return <section data-slot="system-state" role={state === 'error' ? 'alert' : 'status'} className={cn('flex flex-col items-center rounded-overlay text-center', page ? 'w-full gap-4 border-0 p-9' : 'w-full max-w-[420px] gap-3 border p-[22px]', className)}>
    <span aria-hidden="true" className={cn('grid place-items-center rounded-full', page ? 'size-14' : 'size-11', state === 'error' ? 'bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground')}><Icon className={page ? 'size-6' : 'size-5'} /></span>
    <div className="grid gap-1"><h2 className={cn('font-semibold', page ? 'text-xl' : 'text-base')}>{title ?? content.title}</h2><p className={cn('text-muted-foreground', page ? 'text-sm' : 'text-xs')}>{description ?? content.description}</p></div>
    {(primaryAction || secondaryAction) && <div className="flex flex-wrap items-center justify-center gap-2.5">{primaryAction && <Button type="button" size={page ? 'default' : 'sm'} onClick={primaryAction.onClick}>{primaryAction.label}</Button>}{secondaryAction && <Button type="button" size={page ? 'default' : 'sm'} variant="outline" onClick={secondaryAction.onClick}>{secondaryAction.label}</Button>}</div>}
  </section>
}

export { SystemState, type StateAction, type SystemStateKind }
