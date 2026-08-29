'use client';

import { useState, useMemo } from "react";
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

export default function AnimalsContent() {
  const {
    animals,
    isLoading: isLoadingAnimals,
    isError: isAnimalsError,
    error: animalsError,
    updateAnimalImage,
    deleteAnimal,
  } = useAnimalsQuery();
  const { events, isLoading: isLoadingEvents } = useEventsQuery();
  const { isPremium } = useCurrentUser();

  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);

  // Utilise le context pour ouvrir le formulaire
  const { openDrawer: openDrawerForm } = useAnimalFormDrawer();

  const effectiveSelectedId = selectedId ?? animals?.[0]?.id;

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
      setSelectedId(undefined);
    } catch (error) {
      Sentry.captureException(error, { extra: { animalId: animalToDelete.id } });
      toast.error("Une erreur est survenue lors de la suppression de l'animal.");
    } finally {
      setAnimalToDelete(null);
    }
  };

  if (isAnimalsError) {
    return (
      <div role="alert" className="m-6 rounded-xl bg-destructive/10 p-6 text-destructive">
        {animalsError instanceof Error ? animalsError.message : "Impossible de charger vos animaux."}
      </div>
    );
  }

  if (!isLoadingAnimals && animals?.length === 0) {
    return (
      <div className="m-6 rounded-xl bg-card p-6 text-center text-muted-foreground">
        Aucun animal pour le moment. Utilisez l’action d’ajout pour créer votre premier animal.
      </div>
    );
  }

  return (
    // WRAPPER PAGE : donne une hauteur bornée (viewport)
    <div className="flex flex-col min-h-screen">
      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 min-h-0 px-6 py-2 mx-auto w-full">
        {/* Sélecteur d'animal */}
        <div>
            <AnimalSelector
              animals={animals}
              selectedIds={effectiveSelectedId ? [effectiveSelectedId] : []}
              onChange={(ids) => setSelectedId(ids[0])}
              onUpdateAnimalImage={updateAnimalImage}
              showSelectAll={false}
              singleSelect={true}
            />
        </div>

        {/* LIGNE : 2 colonnes qui partagent la même hauteur */}
        <div className="flex flex-col xl:flex-row gap-6 xl:items-stretch h-full min-h-0 mt-4">
          {/* Colonne gauche */}
          <div className="flex flex-col gap-6 xl:flex-1 min-h-0">
            {/* 1. Infos générales */}
            <AnimalGeneralCard
                animal={selectedAnimal}
                isLoading={isLoadingAnimals}
                onEdit={handleEdit}
                onDelete={() => selectedAnimal && setAnimalToDelete(selectedAnimal)}
            />

            {/* 2. Évolution physique */}
            <AnimalEvolutionCard
                idAnimal={effectiveSelectedId}
                isPremium={isPremium}
                canEdit={selectedAnimal?.provenance === 'owner'}
            />

            {/* 3. Infos physiques — prend le reste pour égaliser la hauteur */}
            <AnimalPhysicalCard
                animal={selectedAnimal}
                isLoading={isLoadingAnimals}
                canEdit={selectedAnimal?.provenance === 'owner'}
            />
          </div>

          {/* Colonne droite : Carnet de santé — scrolle en interne */}
          <div className="xl:flex-1 min-h-0">
            <AnimalHealthCard
                isLoading={isLoadingEvents || isLoadingAnimals || !effectiveSelectedId}
                events={medicalEvents}
                animalId={effectiveSelectedId ?? 0}
                isPremium={isPremium}
                canExport={selectedAnimal?.provenance === 'owner'}
            />
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={animalToDelete !== null}
        title="Confirmer la suppression"
        description="Voulez-vous vraiment supprimer cet animal ?"
        onCancel={() => setAnimalToDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
        confirmLabel="Supprimer"
      />
    </div>
  );
}
