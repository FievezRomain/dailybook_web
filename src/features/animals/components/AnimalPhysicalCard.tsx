import { Activity, Ruler, Scale, Utensils } from 'lucide-react'

import type { Animal } from '@/features/animals/types/animal'
import { AnimalHistoryPanel } from './AnimalHistoryPanel'
import { Card } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'

interface AnimalPhysicalCardProps {
  animal?: Animal | null
  isLoading: boolean
  canEdit: boolean
}

function Metric({ icon: Icon, label, value, hint }: { icon: typeof Activity; label: string; value: string; hint: string }) {
  return <div className="relative overflow-hidden rounded-[18px] border bg-card p-4"><span className="grid size-9 place-items-center rounded-[12px] bg-primary/10 text-primary"><Icon className="size-4" aria-hidden="true" /></span><p className="mt-4 text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tracking-[-0.02em]">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{hint}</p></div>
}

export function AnimalPhysicalCard({ animal, isLoading, canEdit }: AnimalPhysicalCardProps) {
  return <Card className="h-full gap-0 overflow-hidden rounded-[24px] p-0 shadow-surface">
    <header className="border-b bg-muted/20 px-5 py-4"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">Suivi</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">Informations physiques</h2><p className="mt-1 text-xs text-muted-foreground">Mesures actuelles et évolution datée.</p></header>
    {isLoading || !animal ? <div className="grid gap-3 p-5 sm:grid-cols-3"><Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div> : <div className="p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric icon={Scale} label="Poids actuel" value={animal.poids ? `${animal.poids} kg` : '—'} hint="Dernière valeur connue" />
        <Metric icon={Ruler} label="Taille actuelle" value={animal.taille ? `${animal.taille} cm` : '—'} hint="Dernière valeur connue" />
        <Metric icon={Utensils} label="Ration habituelle" value={animal.quantity ? `${animal.quantity} ${animal.unity || ''}`.trim() : '—'} hint={animal.food || 'Aliment non renseigné'} />
      </div>
      <AnimalHistoryPanel animalId={animal.id} canEdit={canEdit} />
    </div>}
  </Card>
}
