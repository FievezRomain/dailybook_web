'use client';

import { AnimalSelector } from '@/components/ui/AnimalSelector';
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useState } from 'react';
import { useAnimals } from '@/context/AnimalContext';
import { useObjectives } from "@/context/ObjectiveContext";
import { Objective } from "@/types/objective";
import { ObjectiveList } from '@/components/objectives/ObjectiveList';

export default function ObjectifsContent() {
    const { objectives, isLoading: isLoadingObjectifs } = useObjectives();
    const { animals, isLoading: isLoadingAnimals, updateAnimalImage } = useAnimals();
    const [selectedId, setSelectedId] = useState<number | undefined>(undefined);

    // Met à jour selectedId dès que les animaux sont chargés
    useEffect(() => {
        if (!isLoadingAnimals && animals && selectedId === undefined && animals.length > 0) {
            setSelectedId(animals[0].id);
        }
    }, [isLoadingAnimals, animals, selectedId]);

    const displayableAnimals = useMemo(() => {
        if (isLoadingAnimals || !animals) return [];
        return animals.filter(a => a.provenance !== "group");
    }, [animals, isLoadingAnimals]);

    // Filtre les objectifs pour l'animal sélectionné
    const objectifsAnimal = useMemo(() => {
        if (!objectives || !selectedId) return [];
        return objectives.filter((obj: Objective) => obj.animaux.includes(selectedId));
    }, [objectives, selectedId]);

    const selectedAnimal = useMemo(
        () => (animals && selectedId !== undefined ? animals.find((a) => a.id === selectedId) : undefined),
        [selectedId, animals]
    );

    // Handler pour le changement d'état d'une sous-étape (à adapter selon ta logique métier)
    const handleSousEtapeCheck = (objectiveId: number, etapeId: number) => {
        // Ici, tu peux appeler une mutation ou mettre à jour le state global/context
        // Exemple : updateSousEtapeState(objectiveId, etapeId, "done")
        // À adapter selon ton architecture
    };

    return (
        <div className="flex flex-col">
            {/* CONTENU PRINCIPAL */}
            <div className="flex-1 min-h-0 px-6 py-2 w-full">
                {/* Sélecteur d'animal */}
                <div>
                    <AnimalSelector
                        animals={displayableAnimals}
                        selectedIds={selectedId ? [selectedId] : []}
                        onChange={(ids) => setSelectedId(ids[0])}
                        onUpdateAnimalImage={updateAnimalImage}
                        showSelectAll={false}
                        singleSelect={true}
                    />
                </div>
                <div className="mt-6">
                    {isLoadingObjectifs ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-32 rounded-xl" />
                            ))}
                        </div>
                    ) : objectifsAnimal.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <ObjectiveList objectives={objectifsAnimal} />
                        </div>
                    ) : (
                        <div className="flex justify-center mt-8">
                                <span className="text-muted-foreground text-center">Aucun objectif pour cet animal.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}