import { Animal } from "@/types/animal";
import { getValidAnimalImage } from "@/utils/animalsUtils";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";

export function AnimalAvatar({ animal, onUpdateAnimalImage, width, height }: { animal: Animal, onUpdateAnimalImage: any, width: number, height: number }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Réinitialise l'erreur quand l'URL signée change
    setHasError(false);
  }, [animal.imageSigned?.url]);

  return (
    <div className="rounded-full flex items-center justify-center overflow-hidden relative">
      {animal.imageSigned && !hasError ? (
        <Image
          src={animal.imageSigned.url}
          alt={animal.nom}
          className="w-full h-full object-cover rounded-full border-2 border-background"
          width={width}
          height={height}
          onError={() => {
            setHasError(true);
            getValidAnimalImage(animal, onUpdateAnimalImage);
          }}
        />
      ) : hasError ? (
        <Skeleton className="w-full h-full rounded-full" />
      ) : (
        <span className="text-2xl text-white font-semibold">{animal.nom.charAt(0)}</span>
      )}
    </div>
  );
}