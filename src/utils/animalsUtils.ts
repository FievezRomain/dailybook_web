import { Animal } from "@/types/animal";
import { MappedEvent } from "@/types/event";
import { getFileUrl } from "./s3Utils";

// Filtre les animaux liés à l'événement
// et enrichit leurs données avec l'URL de l'image
export const filterAndEnrichAnimals = (event:MappedEvent, animals: Animal[], userUid:string) => {
    const animalIds = new Set(event.animaux);

    const linkedAnimals = Array.isArray(animals)
    ? animals.reduce((acc, a) => {
        if (animalIds.has(a.id)) acc.push(enrichAnimal(a, userUid));
        return acc;
        }, [] as Animal[])
    : [];

    return linkedAnimals;
}

// Enrichit une liste d'animaux avec l'URL de leur image
export const enrichAnimals = (animals: Animal[], userUid: string) => {
    return animals.map(animal => enrichAnimal(animal, userUid));
}

// Enrichit un animal avec l'URL de son image
const enrichAnimal = (animal: Animal, userUid: string) => {
    return {
        ...animal,
        image: animal.image ? getFileUrl(animal.image, userUid) : undefined
    };
}