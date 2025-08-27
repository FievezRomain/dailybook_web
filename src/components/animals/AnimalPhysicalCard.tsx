import { Skeleton } from "../ui/skeleton";
import { Animal } from "@/types/animal";

interface AnimalPhysicalCardProps {
  animal?: Animal | null;
  isLoading: boolean;
}

export function AnimalPhysicalCard({ animal, isLoading }: AnimalPhysicalCardProps) {
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
        </>
      )}
    </div>
  );
}