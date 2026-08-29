import type { Animal } from "@/features/animals/types/animal";
import type { MappedEvent } from "@/features/events/types/event";
import { getAnimalFileUrl } from "@/features/animals/api/animal-files";
import type { ImageSigned } from "@/types/image";
import type { Objective } from "@/features/objectives/types/objective";

// Cache local pour les URLs signées
const signedUrlCache: { [key: string]: { url: string; expiresAt: number } } = {};

export async function enrichAnimal(animal: Animal): Promise<Animal> {
  if (!animal.image) return animal;

  const cacheKey = `${animal.id}_${animal.image}`;
  const now = Date.now();

  // Si l'URL signée est en cache et encore valide, on la retourne
  if (signedUrlCache[cacheKey] && signedUrlCache[cacheKey].expiresAt > now) {
    return { ...animal, imageSigned: signedUrlCache[cacheKey] };
  }

  // Sinon, on demande une nouvelle URL signée
  const url = await getAnimalFileUrl(animal.image, "animal", animal.id);
  signedUrlCache[cacheKey] = { url, expiresAt: now + 4.5 * 60 * 1000 }; // 4.5 min
  return { ...animal, imageSigned: signedUrlCache[cacheKey] };
}

// Pour enrichir une liste d'animaux
export async function enrichAnimals(animals: Animal[]): Promise<Animal[]> {
  return Promise.all(animals.map(enrichAnimal));
}

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
