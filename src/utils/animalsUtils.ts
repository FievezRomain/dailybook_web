import { Animal } from "@/types/animal";
import { MappedEvent } from "@/types/event";
import { getPresignedGetUrl } from "@/services/storage";

// Cache local pour les URLs signées
const signedUrlCache: { [key: string]: { url: string; expiresAt: number } } = {};

export async function enrichAnimal(animal: Animal, userUid: string): Promise<Animal> {
  if (!animal.image) return animal;

  const cacheKey = `${animal.image}_${userUid}`;
  const now = Date.now();

  // Si l'URL signée est en cache et encore valide, on la retourne
  if (signedUrlCache[cacheKey] && signedUrlCache[cacheKey].expiresAt > now) {
    return { ...animal, image: signedUrlCache[cacheKey].url };
  }

  // Sinon, on demande une nouvelle URL signée
  const url = await getPresignedGetUrl(animal.image, "animal", animal.id);
  signedUrlCache[cacheKey] = { url, expiresAt: now + 4.5 * 60 * 1000 }; // 4.5 min
  return { ...animal, image: url };
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