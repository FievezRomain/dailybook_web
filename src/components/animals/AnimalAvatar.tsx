import { Animal } from "@/types/animal";
import { getValidAnimalImage } from "@/utils/animalsUtils";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";

export function AnimalAvatar({ animal, onUpdateAnimalImage, width, height, classNames }: { animal: Animal, onUpdateAnimalImage: any, width: number, height: number, classNames?: string }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Réinitialise l'erreur quand l'URL signée change
    setHasError(false);
  }, [animal.imageSigned?.url]);

  return (
    <>
      {animal.imageSigned && !hasError ? (
        <Image
          src={animal.imageSigned.url}
          alt={animal.nom}
          className={classNames ? `${classNames}` : `w-full h-full object-cover rounded-full`}
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
    </>
  );
}