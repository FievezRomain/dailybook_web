'use client';

import { AnimalSelector } from '@/features/animals/components/AnimalSelector';
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useMemo, useState } from 'react';
import { useAnimalsQuery } from '@/features/animals/hooks/use-animals';
import { useObjectivesQuery } from "@/features/objectives/hooks/use-objectives";
import type { Objective } from "@/features/objectives/types/objective";
import { ObjectiveList } from './ObjectiveList';

export default function ObjectivesContent() {
    const { objectives, isLoading: isLoadingObjectifs } = useObjectivesQuery();
    const { animals, isLoading: isLoadingAnimals, updateAnimalImage } = useAnimalsQuery();
    const [selectedId, setSelectedId] = useState<number | undefined>(undefined);

    const displayableAnimals = useMemo(() => {
        if (isLoadingAnimals || !animals) return [];
        return animals;
    }, [animals, isLoadingAnimals]);
    const effectiveSelectedId = selectedId ?? displayableAnimals[0]?.id;

    // Filtre les objectifs pour l'animal sélectionné
    const objectifsAnimal = useMemo(() => {
        if (!objectives || !effectiveSelectedId) return [];
        return objectives.filter((obj: Objective) => obj.animaux.includes(effectiveSelectedId));
    }, [objectives, effectiveSelectedId]);

    return (
        <div className="flex flex-col">
            {/* CONTENU PRINCIPAL */}
            <div className="flex-1 min-h-0 px-6 py-2 w-full">
                {/* Sélecteur d'animal */}
                <div>
                    <AnimalSelector
                        animals={displayableAnimals}
                        selectedIds={effectiveSelectedId ? [effectiveSelectedId] : []}
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
