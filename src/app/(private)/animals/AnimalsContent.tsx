'use client';

import { useState, useMemo, useEffect } from "react";
import { AnimalSelector } from "@/components/ui/AnimalSelector";
import { useEvents } from "@/context/EventContext";
import { useAnimals } from "@/context/AnimalContext";
import { AnimalBodyPicture } from "@/types/animal";
import { AnimalGeneralCard } from "@/components/animals/AnimalGeneralCard";
import { AnimalEvolutionCard } from "@/components/animals/AnimalEvolutionCard";
import { AnimalPhysicalCard } from "@/components/animals/AnimalPhysicalCard";
import { useAnimalFormDrawer } from "@/context/AnimalFormDrawerContext";
import { useAnimalDelete } from "@/context/AnimalDeleteContext";
import { AnimalHealthCard } from "@/components/animals/AnimalHealthCard";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function AnimalsContent() {
  const { animals, isLoading: isLoadingAnimals, updateAnimalImage, getBodyPicturesAnimal, updateBodyPictureImage } = useAnimals();
  const { events, isLoading: isLoadingEvents } = useEvents();
  const { isPremium } = useCurrentUser();

  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);

  // Gestion de l'ouverture du dialog pour confirmer la suppression d'un event
  const { openDelete } = useAnimalDelete();

  // Utilise le context pour ouvrir le formulaire
  const { openDrawer: openDrawerForm } = useAnimalFormDrawer();

  // Met à jour selectedId dès que les animaux sont chargés
  useEffect(() => {
    if (!isLoadingAnimals && animals && selectedId === undefined && animals.length > 0) {
      setSelectedId(animals[0].id);
    }
  }, [isLoadingAnimals, animals, selectedId]);

  const selectedAnimal = useMemo(
    () => (animals && selectedId !== undefined ? animals.find((a) => a.id === selectedId) : undefined),
    [selectedId, animals]
  );

  // --- Gestion des photos physiques ---
  const [bodyPics, setBodyPics] = useState<AnimalBodyPicture[]>([]);
  const [isLoadingBodyPics, setIsLoadingBodyPics] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchBodyPics() {
      setIsLoadingBodyPics(true);
      setBodyPics([]);
      if (!selectedAnimal) {
        setIsLoadingBodyPics(false);
        return;
      }
      try {
        if(isPremium === false) {
          setBodyPics([]);
        } else {
          const pics = await getBodyPicturesAnimal(selectedAnimal.id);
          if (!cancelled) setBodyPics(pics);
        }
      } catch {
        if (!cancelled) setBodyPics([]);
      } finally {
        if (!cancelled) setIsLoadingBodyPics(false);
      }
    }
    fetchBodyPics();
    return () => {
      cancelled = true;
    };
  }, [selectedAnimal, getBodyPicturesAnimal]);

  // --- Events médicaux ---
  const medicalEvents = useMemo(
    () =>
      !isLoadingEvents && events && selectedId !== undefined
        ? events.filter(
            (e) => Array.isArray(e.animaux) && e.animaux.includes(selectedId) && ["soins", "rdv"].includes(e.eventtype)
          )
        : [],
    [isLoadingEvents, events, selectedId]
  );

  // Ouvre le drawer pour édition via le context
  const handleEdit = () => {
    if (selectedAnimal) {
      openDrawerForm({ initialAnimal: selectedAnimal });
    }
  };

  return (
    // WRAPPER PAGE : donne une hauteur bornée (viewport)
    <div className="flex flex-col min-h-screen">
      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 min-h-0 px-6 py-2 mx-auto w-full">
        {/* Sélecteur d'animal */}
        <div>
            <AnimalSelector
              animals={animals}
              selectedIds={selectedId ? [selectedId] : []}
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
                onDelete={() => selectedAnimal && openDelete(selectedAnimal)}
            />

            {/* 2. Évolution physique */}
            <AnimalEvolutionCard
                idAnimal={selectedId!}
                isLoading={isLoadingBodyPics}
                bodyPics={bodyPics}
                isPremium={isPremium}
                onAddPhoto={() => console.log("ajout photo")}
                onUpdateBodyPictureImage={updateBodyPictureImage}
            />

            {/* 3. Infos physiques — prend le reste pour égaliser la hauteur */}
            <AnimalPhysicalCard
                animal={selectedAnimal}
                isLoading={isLoadingAnimals}
            />
          </div>

          {/* Colonne droite : Carnet de santé — scrolle en interne */}
          <div className="xl:flex-1 min-h-0">
            <AnimalHealthCard
                isLoading={isLoadingEvents || isLoadingAnimals || !selectedId}
                events={medicalEvents}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
