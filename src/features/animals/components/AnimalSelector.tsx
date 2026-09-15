import { Plus, UsersRound } from 'lucide-react';

import type { ImageSigned } from '@/types/image';
import type { Animal } from '@/features/animals/types/animal';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/shared/components/ui/skeleton';

import { AnimalAvatar } from './AnimalAvatar';

function displayName(animal: Animal) {
  const name = animal.nom?.trim() || 'Animal';
  return name.length > 14 ? `${name.slice(0, 13)}…` : name;
}

function AnimalSelector({
  animals,
  selectedIds,
  onChange,
  onUpdateAnimalImage,
  showSelectAll = false,
  singleSelect = false,
}: {
  animals: Animal[] | undefined;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  onUpdateAnimalImage: (id: number, imageObj: ImageSigned) => void;
  showSelectAll?: boolean;
  singleSelect?: boolean;
}) {
  const allSelected = Boolean(animals?.length) && selectedIds.length === animals?.length;

  const toggleAnimal = (animal: Animal) => {
    if (singleSelect) {
      onChange([animal.id]);
      return;
    }
    onChange(selectedIds.includes(animal.id)
      ? selectedIds.filter((id) => id !== animal.id)
      : [...selectedIds, animal.id]);
  };

  return (
    <section aria-label="Sélectionner un animal" className="min-w-0">
      <div className="flex gap-4 overflow-x-auto px-1 pb-2 pt-1" role={singleSelect ? 'radiogroup' : 'group'} aria-label="Animaux disponibles">
        {showSelectAll && !singleSelect ? (
          <button
            type="button"
            aria-pressed={allSelected}
            onClick={() => onChange(allSelected ? [] : animals?.map((animal) => animal.id) ?? [])}
            className={cn(
              'group grid w-16 shrink-0 justify-items-center gap-1.5 rounded-control p-1 text-xs font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              allSelected && 'text-primary',
            )}
          >
            <span className={cn('grid size-12 place-items-center rounded-full bg-muted text-muted-foreground transition-colors', allSelected && 'bg-primary text-primary-foreground')}>
              <Plus aria-hidden="true" className="size-5" />
            </span>
            <span>Tous</span>
          </button>
        ) : null}

        {animals === undefined ? Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="grid w-16 shrink-0 justify-items-center gap-1" aria-hidden="true">
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
        )) : animals.map((animal) => {
          const selected = selectedIds.includes(animal.id);
          return (
            <button
              key={animal.id}
              type="button"
              role={singleSelect ? 'radio' : undefined}
              aria-label={`${displayName(animal)}${animal.provenance === 'shared' ? ', animal partagé' : ''}`}
              aria-checked={singleSelect ? selected : undefined}
              aria-pressed={singleSelect ? undefined : selected}
              onClick={() => toggleAnimal(animal)}
              className={cn(
                'group grid w-16 shrink-0 justify-items-center gap-1.5 rounded-control p-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selected && 'text-primary',
              )}
            >
              <span className={cn('relative grid size-12 place-items-center rounded-full p-0.5 transition-transform group-hover:scale-[1.03]', selected && 'bg-gradient-to-br from-primary via-[#b07165] to-[#ce9871] shadow-sm')}>
                <span className={cn('size-full overflow-hidden rounded-full', selected ? 'bg-card p-0.5' : 'bg-transparent')}>
                  <AnimalAvatar animal={animal} width={44} height={44} onUpdateAnimalImage={onUpdateAnimalImage} />
                </span>
                {animal.provenance === 'shared' ? (
                  <span aria-hidden="true" className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border bg-card text-muted-foreground shadow-surface">
                    <UsersRound aria-hidden="true" className="size-3" />
                  </span>
                ) : null}
                {selected && selectedIds.length > 1 ? (
                  <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {selectedIds.indexOf(animal.id) + 1}
                  </span>
                ) : null}
              </span>
              <span className="max-w-full truncate" title={animal.nom ?? 'Animal'}>{displayName(animal)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export { AnimalSelector };
