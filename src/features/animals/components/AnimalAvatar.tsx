import type { Animal } from "@/features/animals/types/animal";
import type { ImageSigned } from "@/types/image";
import { getValidAnimalImage } from "@/features/animals/utils/animals";
import { useState } from "react";
import Image from "next/image";

export function AnimalAvatar({ animal, onUpdateAnimalImage, width, height, classNames }: {
  animal: Animal;
  onUpdateAnimalImage: (id: number, image: ImageSigned) => void;
  width: number;
  height: number;
  classNames?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const hasError = failedUrl === animal.imageSigned?.url;
  const initial = animal.nom?.trim().charAt(0).toLocaleUpperCase("fr-FR") || "?";
  const imageUrl = animal.imageSigned && animal.image && !hasError ? animal.imageSigned.url : null;

  return (
    <>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={animal.nom ?? "Animal"}
          className={classNames ? `${classNames}` : `w-full h-full object-cover rounded-full`}
          width={width}
          height={height}
          onError={() => {
            setFailedUrl(animal.imageSigned?.url);
            getValidAnimalImage(animal.imageSigned, animal.image ?? "", animal.id, 'animal', onUpdateAnimalImage, undefined, undefined);
          }}
        />
      ) : (
        <div className={`flex shrink-0 items-center justify-center rounded-full bg-muted text-primary shadow-sm ${classNames ?? ""}`} style={{ width: `${width}px`, height: `${height}px` }}>
          <span className="text-sm font-bold">{initial}</span>
        </div>
      )}
    </>
  );
}
