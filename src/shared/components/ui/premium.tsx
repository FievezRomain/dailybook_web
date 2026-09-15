import type { ReactNode } from 'react'
import { Check, Minus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from './badge'
import { Button } from './button'

function PremiumNotice({ action = 'upgrade', className, context = 'inline', description, onAction, title }: { action?: 'upgrade' | 'dismiss'; className?: string; context?: 'inline' | 'card'; description: string; onAction: () => void; title: string }) {
  const card = context === 'card'
  return <aside data-slot="premium-notice" aria-label={`${title} · Premium`} className={cn('flex border border-foreground/60 bg-card', card ? 'w-full max-w-[380px] flex-col items-start gap-3 rounded-[14px] p-5' : 'w-full max-w-[760px] flex-wrap items-center gap-[14px] rounded-[14px] px-[18px] py-4', className)}>
    <div className={cn('min-w-0', !card && 'flex-1')}><Badge variant="outline" className="mb-2 rounded-full border-foreground/60 bg-transparent">Premium</Badge><p className="text-[15px] font-semibold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p></div>
    <Button type="button" size={action === 'upgrade' ? 'default' : 'sm'} variant={action === 'upgrade' ? 'default' : 'ghost'} onClick={onAction}>{action === 'upgrade' ? 'Découvrir Premium' : 'Masquer'}</Button>
  </aside>
}

const comparisonRows = [
  ['Rappels et suivi', true, true],
  ['Exports avancés', false, true],
  ['Partage d’équipe', false, true],
  ['Automatisations', false, true],
] as const

function Availability({ available }: { available: boolean }) {
  const Icon = available ? Check : Minus
  return <span className={cn('inline-flex justify-center', available ? 'text-success' : 'text-muted-foreground')} aria-label={available ? 'Inclus' : 'Non inclus'}><Icon aria-hidden="true" className="size-4" /></span>
}

function PremiumComparison({ className, essentialAction, layout = 'compact', premiumAction }: { className?: string; essentialAction?: ReactNode; layout?: 'compact' | 'wide'; premiumAction?: ReactNode }) {
  return <section data-slot="premium-comparison" aria-label="Comparatif des abonnements" className={cn('w-full overflow-hidden rounded-overlay border bg-card', layout === 'wide' ? 'max-w-[820px]' : 'max-w-[380px]', className)}>
    <div className={cn('grid', layout === 'wide' ? 'grid-cols-2' : 'grid-cols-1')}><div className="grid gap-2 p-[18px]"><h3 className="font-semibold">Essentiel</h3><p className="text-xs text-muted-foreground">Les fonctions quotidiennes pour prendre soin de vos animaux.</p>{essentialAction}</div><div className={cn('grid gap-2 p-[18px]', layout === 'wide' ? 'border-l' : 'border-t')}><div className="flex items-center gap-2"><h3 className="font-semibold">Premium</h3><Badge variant="outline" className="border-foreground/60 bg-transparent">Premium</Badge></div><p className="text-xs text-muted-foreground">Les outils avancés de partage, d’analyse et d’automatisation.</p>{premiumAction}</div></div>
    <table className="w-full border-collapse text-xs"><thead className="sr-only"><tr><th>Fonctionnalité</th><th>Essentiel</th><th>Premium</th></tr></thead><tbody>{comparisonRows.map(([feature, essential, premium]) => <tr key={feature} className="border-t"><th scope="row" className="px-4 py-[11px] text-left font-medium">{feature}</th><td className="w-20 px-3 text-center"><Availability available={essential} /></td><td className="w-20 px-3 text-center"><Availability available={premium} /></td></tr>)}</tbody></table>
  </section>
}

export { PremiumComparison, PremiumNotice }
