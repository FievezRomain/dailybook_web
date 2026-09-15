import { CalendarDays, Dna, Fingerprint, MoreHorizontal, Palette, PawPrint, ShieldCheck, UsersRound } from 'lucide-react'

import type { Animal } from '@/features/animals/types/animal'
import { Button, Card, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui'
import { Skeleton } from '@/shared/components/ui/skeleton'

interface AnimalGeneralCardProps {
  animal?: Animal | null
  isLoading: boolean
  onEdit: () => void
  onDelete: () => void
}

function formatDate(value?: string | null) {
  return value ? new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Non renseignée'
}

function Fact({ icon: Icon, label, value }: { icon: typeof PawPrint; label: string; value?: string | null }) {
  return <div className="flex min-w-0 items-start gap-3 rounded-[16px] bg-muted/35 p-3"><span className="grid size-8 shrink-0 place-items-center rounded-[11px] bg-card text-primary shadow-sm"><Icon className="size-4" aria-hidden="true" /></span><div className="min-w-0"><dt className="text-[11px] text-muted-foreground">{label}</dt><dd className="mt-0.5 break-words text-sm font-semibold">{value || 'Non renseigné'}</dd></div></div>
}

export function AnimalGeneralCard({ animal, isLoading, onEdit, onDelete }: AnimalGeneralCardProps) {
  return <Card className="h-full gap-0 overflow-hidden rounded-[24px] p-0 shadow-surface">
    <header className="flex items-start justify-between gap-3 border-b bg-muted/20 px-5 py-4">
      <div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">Profil</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">Informations générales</h2></div>
      {animal?.provenance === 'owner' && <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Options animal" className="shrink-0"><MoreHorizontal aria-hidden="true" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={onEdit}>Modifier</DropdownMenuItem><DropdownMenuItem className="text-destructive" onClick={onDelete}>Supprimer</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}
    </header>
    {isLoading || !animal ? <div className="space-y-3 p-5"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-36 w-full" /></div> : <div className="p-5">
      <div className={`mb-4 flex items-center gap-2 rounded-[14px] px-3 py-2 text-xs font-medium ${animal.provenance === 'shared' ? 'bg-info/10 text-info' : 'bg-success/10 text-success'}`}>{animal.provenance === 'shared' ? <UsersRound className="size-4" aria-hidden="true" /> : <ShieldCheck className="size-4" aria-hidden="true" />}<span>{animal.provenance === 'shared' ? 'Partagé via un groupe · lecture seule' : 'Vous êtes propriétaire'}</span></div>
      <dl className="grid gap-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
        <Fact icon={PawPrint} label="Espèce" value={animal.espece} />
        <Fact icon={Dna} label="Race" value={animal.race} />
        <Fact icon={CalendarDays} label="Naissance" value={formatDate(animal.datenaissance)} />
        <Fact icon={Palette} label="Robe ou couleur" value={animal.couleur} />
        <Fact icon={Fingerprint} label="Identification" value={animal.numeroidentification} />
        <Fact icon={CalendarDays} label="Arrivée" value={formatDate(animal.datearrivee)} />
      </dl>
      {(animal.nompere || animal.nommere) && <section className="mt-5 border-t pt-4"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filiation</h3><div className="mt-3 grid grid-cols-2 gap-4 text-sm"><p><span className="block text-xs text-muted-foreground">Père</span><strong>{animal.nompere || 'Non renseigné'}</strong></p><p><span className="block text-xs text-muted-foreground">Mère</span><strong>{animal.nommere || 'Non renseignée'}</strong></p></div></section>}
      {animal.informations && <section className="mt-5 rounded-[16px] border-l-2 border-primary bg-primary/5 p-4"><h3 className="text-xs font-semibold uppercase tracking-wide text-primary">À savoir</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{animal.informations}</p></section>}
      {(animal.datedepart || animal.datedeces) && <p className="mt-4 text-xs text-muted-foreground">{animal.datedeces ? `Décès : ${formatDate(animal.datedeces)}` : `Départ : ${formatDate(animal.datedepart)}`}</p>}
    </div>}
  </Card>
}
