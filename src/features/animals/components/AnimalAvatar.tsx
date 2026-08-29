import type { Animal } from "@/features/animals/types/animal";
import type { ImageSigned } from "@/types/image";
import { getValidAnimalImage } from "@/features/animals/utils/animals";
import { useState } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
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

  return (
    <>
      {animal.imageSigned && animal.image && !hasError ? (
        <Image
          src={animal.imageSigned.url}
          alt={animal.nom ?? "Animal"}
          className={classNames ? `${classNames}` : `w-full h-full object-cover rounded-full`}
          width={width}
          height={height}
          onError={() => {
            setFailedUrl(animal.imageSigned?.url);
            getValidAnimalImage(animal.imageSigned, animal.image ?? "", animal.id, 'animal', onUpdateAnimalImage, undefined, undefined);
          }}
        />
      ) : hasError ? (
        <Skeleton className="w-full h-full rounded-full" />
      ) : (
        <div className="w-full h-full rounded-full flex items-center justify-center shadow-sm" style={{ width: `${width}px`, height: `${height}px` }}>
          <span className="text-2xl font-semibold">{animal.nom?.charAt(0) ?? "?"}</span>
        </div>
      )}
    </>
  );
}
