'use client';

import { useState, useMemo, useEffect } from "react";
import { AnimalSelector } from "@/components/ui/AnimalSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { EventList } from "@/components/events/EventList";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useEvents } from "@/context/EventContext";
import { useAnimals } from "@/context/AnimalContext";
import { AnimalBodyPicture } from "@/types/animal";

export default function AnimalsContent() {
  const { animals, isLoading: isLoadingAnimals, updateAnimalImage, getBodyPicturesAnimal } = useAnimals();
  const { events, isLoading: isLoadingEvents } = useEvents();

  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);

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
        const pics = await getBodyPicturesAnimal(selectedAnimal.id);
        if (!cancelled) setBodyPics(pics);
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

  return (
    // WRAPPER PAGE : donne une hauteur bornée (viewport)
    <div className="flex flex-col min-h-screen">
      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 min-h-0 px-6 py-2 mx-auto w-full">
        {/* Sélecteur d'animal */}
        <div>
          {isLoadingAnimals ? (
            <div className="flex gap-4 overflow-x-auto py-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="w-16 h-16 rounded-full" />
              ))}
            </div>
          ) : (
            <AnimalSelector
              animals={animals}
              selectedIds={selectedId ? [selectedId] : []}
              onChange={(ids) => setSelectedId(ids[0])}
              onUpdateAnimalImage={updateAnimalImage}
              showSelectAll={false}
              singleSelect={true}
            />
          )}
        </div>

        {/* LIGNE : 2 colonnes qui partagent la même hauteur */}
        <div className="flex flex-col xl:flex-row gap-6 xl:items-stretch h-full min-h-0 mt-4">
          {/* Colonne gauche */}
          <div className="flex flex-col gap-6 xl:flex-1 min-h-0">
            {/* 1. Infos générales */}
            <div className="bg-card rounded-xl shadow-sm dark:shadow-lg dark:shadow-black/30 p-6 flex flex-col gap-2">
              <h2 className="text-lg font-bold mb-2">Informations générales</h2>
              {isLoadingAnimals ? (
                <Skeleton className="h-24 w-full" />
              ) : selectedAnimal ? (
                <>
                  <div><strong>Nom :</strong> {selectedAnimal.nom}</div>
                  <div><strong>Espèce :</strong> {selectedAnimal.espece}</div>
                  <div><strong>Date de naissance :</strong> {selectedAnimal.datenaissance ?? ""}</div>
                  <div><strong>Race :</strong> {selectedAnimal.race ?? ""}</div>
                  <div><strong>Date d'arrivée :</strong> {selectedAnimal.datearrivee ?? ""}</div>
                  <div><strong>Date de départ :</strong> {selectedAnimal.datedepart ?? ""}</div>
                  <div><strong>Informations supplémentaires :</strong> {selectedAnimal.informations ?? ""}</div>
                  <div><strong>Nom de la mère :</strong> {selectedAnimal.nommere ?? ""}</div>
                  <div><strong>Nom du père :</strong> {selectedAnimal.nompere ?? ""}</div>
                  <div><strong>Numéro d'identification :</strong> {selectedAnimal.numeroidentification ?? ""}</div>
                  <div><strong>Robe :</strong> {selectedAnimal.robe ?? ""}</div>
                  <div><strong>Sexe :</strong> {selectedAnimal.sexe ?? ""}</div>
                  {selectedAnimal.datedeces && <div><strong>Date de décès :</strong> {selectedAnimal.datedeces}</div>}
                </>
              ) : (
                <Skeleton className="h-6 w-2/3" />
              )}
            </div>

            {/* 2. Évolution physique */}
            <div className="bg-card flex flex-col gap-2 rounded-xl shadow-sm dark:shadow-lg dark:shadow-black/30 p-6 flex-1 min-h-0">
              <h2 className="text-lg font-bold mb-2">Évolution physique</h2>
              {isLoadingBodyPics ? (
                <Skeleton className="w-full h-48 rounded-xl" />
              ) : bodyPics.length > 0 ? (
                <div className="w-full max-w-xl mx-auto">
                  <Carousel>
                    <CarouselContent>
                      {bodyPics.map((photo, idx) => (
                        <CarouselItem key={idx} className="flex flex-col items-center justify-center">
                          <img
                            src={photo.url}
                            alt={photo.filename || `Photo ${idx + 1}`}
                            className="rounded-xl object-cover w-full h-48 transition-transform duration-300 hover:scale-105"
                            style={{ maxHeight: 220 }}
                          />
                          <div className="mt-2 text-sm text-muted-foreground">
                            {photo.date_enregistrement && <span>{photo.date_enregistrement}</span>}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">Aucune photo physique disponible.</div>
              )}
            </div>

            {/* 3. Infos physiques — prend le reste pour égaliser la hauteur */}
            <div className="bg-card rounded-xl shadow-sm dark:shadow-lg dark:shadow-black/30 p-6 flex flex-col gap-2">
              <h2 className="text-lg font-bold mb-2">Informations physiques</h2>
              {isLoadingAnimals ? (
                <Skeleton className="h-24 w-full" />
              ) : selectedAnimal ? (
                <>
                  <div><strong>Poids :</strong> {selectedAnimal.poids ? selectedAnimal.poids + " " + "kg" : ""}</div>
                  <div><strong>Taille :</strong> {selectedAnimal.taille ? selectedAnimal.taille + " " + "cm" : ""}</div>
                  <div><strong>Ration alimentaire :</strong> {selectedAnimal.food ?? ""}</div>
                  <div><strong>Quantité :</strong> {selectedAnimal.quantity ?? ""} {selectedAnimal.unity ?? ""}</div>
                </>
              ) : (
                <Skeleton className="h-6 w-2/3" />
              )}
            </div>
          </div>

          {/* Colonne droite : Carnet de santé — scrolle en interne */}
          <div className="xl:flex-1 min-h-0">
            <div className="bg-card rounded-xl shadow-sm dark:shadow-lg dark:shadow-black/30 p-6 h-full overflow-hidden flex flex-col max-h-[120dvh]">
              <h2 className="text-xl font-bold mb-4">Carnet de santé</h2>
              {isLoadingEvents ? (
                <Skeleton className="h-32 w-full rounded-xl" />
              ) : (
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <div className="w-full px-2">
                    <EventList events={medicalEvents} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
