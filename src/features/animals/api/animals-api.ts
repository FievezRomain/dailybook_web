import { webApiClient } from '@/shared/api/web-api-client';
import {
  animalHistoryListSchema, animalListSchema, animalSchema, bodyPictureListSchema,
  bodyPictureSchema,
} from '../schemas/animal';
import type {
  AnimalHistoryItem, CreateAnimalInput, UpdateAnimalInput,
} from '../types/animal';

export async function getAnimals() {
  return animalListSchema.parse((await webApiClient.get('/animals')).data);
}

export async function createAnimal(input: CreateAnimalInput) {
  return animalSchema.parse((await webApiClient.post('/animals', input)).data);
}

export async function updateAnimal(id: number, input: UpdateAnimalInput) {
  return animalSchema.parse((await webApiClient.put(`/animals/${id}`, input)).data);
}

export async function deleteAnimal(id: number) {
  await webApiClient.delete(`/animals/${id}`);
}

export async function getAnimalHistory(id: number, item: AnimalHistoryItem) {
  return animalHistoryListSchema.parse((await webApiClient.get(`/animals/${id}/history/${item}`)).data);
}

export async function createAnimalHistory(id: number, input: {
  item: AnimalHistoryItem; value?: string | number | null; unity?: string | null; datemodification?: string | null;
}) {
  return animalSchema.parse((await webApiClient.post(`/animals/${id}/history`, input)).data);
}

export async function updateAnimalHistory(id: number, historyId: number, input: {
  item: AnimalHistoryItem; value?: string | number | null; unity?: string | null; datemodification?: string | null;
}) {
  return animalSchema.parse((await webApiClient.put(
    `/animals/${id}/history/${input.item}/${historyId}`, input,
  )).data);
}

export async function deleteAnimalHistory(id: number, item: AnimalHistoryItem, historyId: number) {
  await webApiClient.delete(`/animals/${id}/history/${item}/${historyId}`);
}

export async function getBodyPictures(id: number) {
  return bodyPictureListSchema.parse((await webApiClient.get(`/animals/${id}/body-pictures`)).data);
}

export async function createBodyPicture(id: number, filename: string, date?: string) {
  return bodyPictureSchema.parse((await webApiClient.post(`/animals/${id}/body-pictures`, {
    filename, date_enregistrement: date,
  })).data);
}

export async function deleteBodyPicture(pictureId: number) {
  await webApiClient.delete(`/animals/body-pictures/${pictureId}`);
}
