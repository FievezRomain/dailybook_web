import { Skeleton } from "@/shared/components/ui/skeleton";
import type { Animal } from "@/features/animals/types/animal";
import { AnimalHistoryPanel } from './AnimalHistoryPanel';

interface AnimalPhysicalCardProps {
  animal?: Animal | null;
  isLoading: boolean;
  canEdit: boolean;
}

export function AnimalPhysicalCard({ animal, isLoading, canEdit }: AnimalPhysicalCardProps) {
  return (
    <div className="bg-card rounded-xl shadow-sm dark:shadow-lg dark:shadow-black/30 p-6 flex flex-col gap-2">
      <h2 className="text-lg font-bold mb-2">Informations physiques</h2>
      {isLoading || !animal ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <>
          <div><strong>Poids :</strong> {animal.poids ? animal.poids + " kg" : ""}</div>
          <div><strong>Taille :</strong> {animal.taille ? animal.taille + " cm" : ""}</div>
          <div><strong>Ration alimentaire :</strong> {animal.food ?? ""}</div>
          <div><strong>Quantité :</strong> {animal.quantity ?? ""} {animal.unity ?? ""}</div>
          <AnimalHistoryPanel animalId={animal.id} canEdit={canEdit} />
        </>
      )}
    </div>
  );
}
