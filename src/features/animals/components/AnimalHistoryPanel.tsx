'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog';
import { useAnimalHistory } from '../hooks/use-animal-history';
import type { AnimalHistory, AnimalHistoryItem } from '../types/animal';

const ITEMS: Array<{ item: AnimalHistoryItem; label: string; unit?: string; numeric: boolean }> = [
  { item: 'poids', label: 'Poids', unit: 'kg', numeric: true },
  { item: 'taille', label: 'Taille', unit: 'cm', numeric: true },
  { item: 'food', label: 'Aliment', numeric: false },
  { item: 'quantity', label: 'Quantité', numeric: true },
];

export function AnimalHistoryPanel({ animalId, canEdit }: { animalId: number; canEdit: boolean }) {
  const [item, setItem] = useState<AnimalHistoryItem>('poids');
  const config = ITEMS.find((candidate) => candidate.item === item) ?? ITEMS[0];
  const history = useAnimalHistory(animalId, item);
  const [editing, setEditing] = useState<AnimalHistory | null>(null);
  const [deleting, setDeleting] = useState<AnimalHistory | null>(null);
  const [value, setValue] = useState('');
  const [unity, setUnity] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const ordered = useMemo(
    () => [...history.entries].sort((left, right) =>
      (right.datemodification ?? '').localeCompare(left.datemodification ?? '') || right.id - left.id),
    [history.entries],
  );

  const resetForm = () => {
    setEditing(null);
    setValue('');
    setUnity('');
    setDate(new Date().toISOString().slice(0, 10));
  };

  const selectItem = (next: AnimalHistoryItem) => {
    setItem(next);
    resetForm();
  };

  const startEdit = (entry: AnimalHistory) => {
    setEditing(entry);
    setValue(entry.value == null ? '' : String(entry.value));
    setUnity(entry.unity ?? '');
    setDate(entry.datemodification ?? new Date().toISOString().slice(0, 10));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || (config.numeric && (!Number.isFinite(Number(trimmed)) || Number(trimmed) < 0))) {
      toast.error(config.numeric ? 'Saisissez une valeur positive.' : 'Saisissez une valeur.');
      return;
    }
    const input = {
      value: config.numeric ? Number(trimmed) : trimmed,
      unity: item === 'quantity' ? unity.trim() || null : config.unit ?? null,
      datemodification: date,
    };
    try {
      if (editing) await history.updateEntry({ historyId: editing.id, input });
      else await history.createEntry(input);
      toast.success(editing ? 'Entrée d’historique modifiée.' : 'Entrée d’historique ajoutée.');
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible d’enregistrer cette entrée.');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await history.deleteEntry(deleting.id);
      toast.success('Entrée d’historique supprimée.');
      setDeleting(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de supprimer cette entrée.');
    }
  };

  return (
    <section className="mt-4 border-t pt-4" aria-labelledby="animal-history-title">
      <h3 id="animal-history-title" className="font-semibold">Historique daté</h3>
      <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Type d’historique">
        {ITEMS.map((candidate) => (
          <Button key={candidate.item} type="button" size="sm"
            variant={candidate.item === item ? 'default' : 'outline'}
            role="tab" aria-selected={candidate.item === item}
            onClick={() => selectItem(candidate.item)}>
            {candidate.label}
          </Button>
        ))}
      </div>

      {history.isLoading ? <Skeleton className="mt-4 h-24 w-full" /> : history.isError ? (
        <div role="alert" className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          Impossible de charger cet historique.{' '}
          <button type="button" className="underline" onClick={() => void history.refetch()}>Réessayer</button>
        </div>
      ) : ordered.length ? (
        <ul className="mt-4 space-y-2" aria-live="polite">
          {ordered.map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted p-3 text-sm">
              <span>
                <strong>{String(entry.value ?? '—')}{entry.unity ? ` ${entry.unity}` : config.unit ? ` ${config.unit}` : ''}</strong>
                {' · '}{entry.datemodification ? new Date(`${entry.datemodification}T12:00:00`).toLocaleDateString('fr-FR') : 'Date inconnue'}
              </span>
              {canEdit ? <span className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => startEdit(entry)}>Modifier</Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => setDeleting(entry)}>Supprimer</Button>
              </span> : null}
            </li>
          ))}
        </ul>
      ) : <p className="mt-4 text-sm text-muted-foreground">Aucune entrée dans cet historique.</p>}

      {canEdit ? (
        <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end" onSubmit={submit}>
          <label className="grid gap-1 text-sm" htmlFor={`history-value-${animalId}`}>
            {config.label}
            <Input id={`history-value-${animalId}`} type={config.numeric ? 'number' : 'text'} min={config.numeric ? 0 : undefined}
              step={config.numeric ? 'any' : undefined} value={value} onChange={(event) => setValue(event.target.value)} required />
          </label>
          <label className="grid gap-1 text-sm" htmlFor={`history-date-${animalId}`}>
            Date
            <Input id={`history-date-${animalId}`} type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
          </label>
          {item === 'quantity' ? <label className="grid gap-1 text-sm" htmlFor={`history-unit-${animalId}`}>
            Unité
            <Input id={`history-unit-${animalId}`} value={unity} onChange={(event) => setUnity(event.target.value)} placeholder="g, kg…" />
          </label> : null}
          <Button type="submit" disabled={history.isMutating}>{editing ? 'Enregistrer' : 'Ajouter'}</Button>
          {editing ? <Button type="button" variant="ghost" onClick={resetForm}>Annuler</Button> : null}
        </form>
      ) : <p className="mt-4 text-sm text-muted-foreground">Historique partagé en lecture seule.</p>}

      <ConfirmDialog open={deleting !== null} title="Supprimer cette entrée ?"
        description="Cette donnée de suivi sera supprimée définitivement."
        confirmLabel="Supprimer" onCancel={() => setDeleting(null)} onConfirm={() => void confirmDelete()} />
    </section>
  );
}
