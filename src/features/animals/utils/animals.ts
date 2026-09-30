import type { Animal } from "@/features/animals/types/animal";
import type { MappedEvent } from "@/features/events/types/event";
import { getAnimalFileUrl } from "@/features/animals/api/animal-files";
import type { ImageSigned } from "@/types/image";
import type { Objective } from "@/features/objectives/types/objective";

// Pour enrichir les animaux liés à un event ou un objectif
export function filterAnimals(obj: MappedEvent | Objective, animals: Animal[]): Animal[] {
  const animalIds = new Set(obj.animaux);
  const linked = Array.isArray(animals)
    ? animals.filter(a => animalIds.has(a.id))
    : [];
  return linked;
}

export function getValidAnimalImage(
  imageSigned: ImageSigned | undefined,
  filename: string,
  idAnimal: number,
  ressourceType: "animal" | "body",
  updateImage?: (idAnimal: number, imageObj: ImageSigned) => void,
  updateBodyPictureImage?: (idAnimal: number, bodyPictureId: number, imageObj: ImageSigned) => void,
  bodyPictureId?: number
): string | undefined {
  if (!imageSigned || typeof imageSigned === "string") return undefined;

  const { url, expiresAt } = imageSigned;
  if (expiresAt > Date.now()) {
    return url;
  }

  getAnimalFileUrl(filename, ressourceType, idAnimal).then(newUrl => {
    const newImageObj: ImageSigned = { url: newUrl, expiresAt: Date.now() + 4.5 * 60 * 1000 };
    if (ressourceType === "animal" && updateImage) {
      updateImage(idAnimal, newImageObj);
    } else if (ressourceType === "body" && updateBodyPictureImage && bodyPictureId !== undefined) {
      updateBodyPictureImage(idAnimal, bodyPictureId, newImageObj);
    }
  });
  return undefined;
}
