import { Animal } from "@/types/animal";
import { MappedEvent } from "@/types/event";
import { getPresignedGetUrl } from "@/services/storage";
import { ImageSigned } from "@/types/image";

// Cache local pour les URLs signées
const signedUrlCache: { [key: string]: { url: string; expiresAt: number } } = {};

export async function enrichAnimal(animal: Animal, userUid: string): Promise<Animal> {
  if (!animal.image) return animal;

  const cacheKey = `${animal.image}_${userUid}`;
  const now = Date.now();

  // Si l'URL signée est en cache et encore valide, on la retourne
  if (signedUrlCache[cacheKey] && signedUrlCache[cacheKey].expiresAt > now) {
    return { ...animal, imageSigned: signedUrlCache[cacheKey] };
  }

  // Sinon, on demande une nouvelle URL signée
  const url = await getPresignedGetUrl(animal.image, "animal", animal.id);
  signedUrlCache[cacheKey] = { url, expiresAt: now + 4.5 * 60 * 1000 }; // 4.5 min
  return { ...animal, imageSigned: signedUrlCache[cacheKey] };
}

// Pour enrichir une liste d'animaux
export async function enrichAnimals(animals: Animal[], userUid: string): Promise<Animal[]> {
  return Promise.all(animals.map(animal => enrichAnimal(animal, userUid)));
}

// Pour enrichir les animaux liés à un event
export function filterAnimals(event: MappedEvent, animals: Animal[]): Animal[] {
  const animalIds = new Set(event.animaux);
  const linked = Array.isArray(animals)
    ? animals.filter(a => animalIds.has(a.id))
    : [];
  return linked;
}

export function getValidAnimalImage(animal: Animal, updateAnimalImage?: (id: number, imageObj: ImageSigned) => void): string | undefined {
  if (!animal.image || !animal.imageSigned || typeof animal.imageSigned === "string") return undefined;
  const { url, expiresAt } = animal.imageSigned;
  if (expiresAt > Date.now()) {
    return url;
  }
  // URL expirée, lance le refresh en arrière-plan
  getPresignedGetUrl(animal.image, "animal", animal.id).then(newUrl => {
    const newImageObj: ImageSigned = { url: newUrl, expiresAt: Date.now() + 4.5 * 60 * 1000 };
    if (updateAnimalImage) updateAnimalImage(animal.id, newImageObj);
  });
  return undefined; // On retourne undefined, le composant affichera un Skeleton ou une valeur par défaut le temps que l'image se charge
}