'use client';

import { useState, useMemo } from "react";
import { CalendarDays, Ruler, Scale } from 'lucide-react';
import { AnimalSelector } from "./AnimalSelector";
import { useEventsQuery } from "@/features/events/hooks/use-events";
import { useAnimalsQuery } from "@/features/animals/hooks/use-animals";
import { AnimalGeneralCard } from "./AnimalGeneralCard";
import { AnimalEvolutionCard } from "./AnimalEvolutionCard";
import { AnimalPhysicalCard } from "./AnimalPhysicalCard";
import { useAnimalFormDrawer } from "@/features/animals/context/animal-form-drawer-context";
import { AnimalHealthCard } from "./AnimalHealthCard";
import { useCurrentUser } from '@/features/user/hooks/use-current-user';
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog';
import type { Animal } from '@/features/animals/types/animal';
import { toast } from 'sonner';
import * as Sentry from '@sentry/react';
import { getAnimalMedicalEvents } from '../utils/animal-medical';
import { PageShell } from '@/shared/components/layout/PageShell';
import { SystemState } from '@/shared/components/ui/system-state';
import { AnimalAvatar } from './AnimalAvatar';

function ageLabel(date?: string | null) {
  if (!date) return 'Âge inconnu';
  const birth = new Date(`${date}T12:00:00`);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) years -= 1;
  return years >= 1 ? `${years} an${years > 1 ? 's' : ''}` : 'Moins d’un an';
}

export default function AnimalsContent() {
  const {
    animals,
    isLoading: isLoadingAnimals,
    isError: isAnimalsError,
    error: animalsError,
    refetch,
    updateAnimalImage,
    deleteAnimal,
  } = useAnimalsQuery();
  const { events, isLoading: isLoadingEvents } = useEventsQuery();
  const { isPremium } = useCurrentUser();

  const [animalId, setAnimalId] = useState<number | null>(null);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);

  // Utilise le context pour ouvrir le formulaire
  const { openDrawer: openDrawerForm } = useAnimalFormDrawer();

  const effectiveSelectedId = animalId ?? animals?.[0]?.id;

  const selectedAnimal = useMemo(
    () => (animals && effectiveSelectedId !== undefined ? animals.find((a) => a.id === effectiveSelectedId) : undefined),
    [effectiveSelectedId, animals]
  );

  // --- Events médicaux ---
  const medicalEvents = useMemo(
    () =>
      !isLoadingEvents && events && effectiveSelectedId !== undefined
        ? getAnimalMedicalEvents(events, effectiveSelectedId)
        : [],
    [isLoadingEvents, events, effectiveSelectedId]
  );

  // Ouvre le drawer pour édition via le context
  const handleEdit = () => {
    if (selectedAnimal) {
      openDrawerForm({ initialAnimal: selectedAnimal });
    }
  };

  const handleConfirmDelete = async () => {
    if (!animalToDelete) return;
    try {
      await deleteAnimal(animalToDelete.id);
      toast.success("Animal supprimé avec succès.");
      setAnimalId(null);
    } catch (error) {
      Sentry.captureException(error, { extra: { animalId: animalToDelete.id } });
      toast.error("Une erreur est survenue lors de la suppression de l'animal.");
    } finally {
      setAnimalToDelete(null);
    }
  };

  if (isAnimalsError) {
    return (
      <PageShell><SystemState state="error" density="page" title="Impossible de charger vos animaux" description={animalsError instanceof Error ? animalsError.message : 'Vos fiches animales sont temporairement indisponibles.'} primaryAction={{ label: 'Réessayer', onClick: () => void refetch() }} /></PageShell>
    );
  }

  if (!isLoadingAnimals && animals?.length === 0) {
    return (
      <PageShell><SystemState state="empty" density="page" title="Votre espace animaux est prêt" description="Utilisez l’action Créer du menu principal pour ajouter votre premier animal." /></PageShell>
    );
  }

  return (
    <PageShell className="space-y-6">
      <div className="space-y-6">
        <div className="border-b pb-3">
            <AnimalSelector
              animals={animals}
              selectedIds={effectiveSelectedId ? [effectiveSelectedId] : []}
              onChange={(ids) => setAnimalId(ids[0] ?? null)}
              onUpdateAnimalImage={updateAnimalImage}
              showSelectAll={false}
              singleSelect={true}
            />
        </div>

        {selectedAnimal ? <section aria-label={`Aperçu de ${selectedAnimal.nom || 'l’animal'}`} className="relative overflow-hidden rounded-[26px] border bg-card shadow-surface">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-[#b07165] to-[#ce9871]" />
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="shrink-0 rounded-full bg-muted p-1.5">
              <AnimalAvatar animal={selectedAnimal} width={82} height={82} classNames="size-[82px] rounded-full object-cover" onUpdateAnimalImage={updateAnimalImage} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-3xl font-semibold tracking-[-0.03em]">{selectedAnimal.nom || 'Animal'}</h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">{selectedAnimal.provenance === 'shared' ? 'Partagé' : 'Mon animal'}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{[selectedAnimal.espece, selectedAnimal.race, selectedAnimal.sexe].filter(Boolean).join(' · ') || 'Profil à compléter'}</p>
            </div>
            <dl className="grid grid-cols-3 divide-x rounded-[18px] bg-muted/45 px-2 py-3 sm:min-w-[330px]">
              <div className="px-3"><dt className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><CalendarDays className="size-3.5" aria-hidden="true" />Âge</dt><dd className="mt-1 text-sm font-semibold">{ageLabel(selectedAnimal.datenaissance)}</dd></div>
              <div className="px-3"><dt className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Scale className="size-3.5" aria-hidden="true" />Poids</dt><dd className="mt-1 text-sm font-semibold">{selectedAnimal.poids ? `${selectedAnimal.poids} kg` : '—'}</dd></div>
              <div className="px-3"><dt className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Ruler className="size-3.5" aria-hidden="true" />Taille</dt><dd className="mt-1 text-sm font-semibold">{selectedAnimal.taille ? `${selectedAnimal.taille} cm` : '—'}</dd></div>
            </dl>
          </div>
        </section> : <div className="min-h-36 animate-pulse rounded-[26px] bg-muted motion-reduce:animate-none" />}

        <section aria-label="Fiche animale" className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-12">
            <div className="xl:col-span-5">
            <AnimalGeneralCard
                animal={selectedAnimal}
                isLoading={isLoadingAnimals}
                onEdit={handleEdit}
                onDelete={() => selectedAnimal && setAnimalToDelete(selectedAnimal)}
            />
            </div>
          <div className="xl:col-span-7">
            <AnimalHealthCard
                isLoading={isLoadingEvents || isLoadingAnimals || !effectiveSelectedId}
                events={medicalEvents}
                animalId={effectiveSelectedId ?? 0}
                isPremium={isPremium}
                canExport={selectedAnimal?.provenance === 'owner'}
            />
          </div>
          <div className="xl:col-span-7"><AnimalPhysicalCard animal={selectedAnimal} isLoading={isLoadingAnimals} canEdit={selectedAnimal?.provenance === 'owner'} /></div>
          <div className="xl:col-span-5"><AnimalEvolutionCard idAnimal={effectiveSelectedId} isPremium={isPremium} canEdit={selectedAnimal?.provenance === 'owner'} /></div>
        </section>
      </div>
      <ConfirmDialog
        open={animalToDelete !== null}
        title="Confirmer la suppression"
        description="Voulez-vous vraiment supprimer cet animal ?"
        onCancel={() => setAnimalToDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
        confirmLabel="Supprimer"
      />
    </PageShell>
  );
}
