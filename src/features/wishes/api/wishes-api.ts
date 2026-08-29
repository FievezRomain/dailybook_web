import { webApiClient } from '@/shared/api/web-api-client';
import { wishListSchema, wishSchema } from '../schemas/wish';
import type { CreateWishInput, UpdateWishInput } from '../types/wish';

export async function getWishes() {
  return wishListSchema.parse((await webApiClient.get('/wishes')).data);
}

export async function createWish(input: CreateWishInput) {
  return wishSchema.parse((await webApiClient.post('/wishes', input)).data);
}

export async function updateWish(id: number, input: UpdateWishInput) {
  return wishSchema.parse((await webApiClient.put(`/wishes/${id}`, input)).data);
}

export async function deleteWish(id: number) {
  await webApiClient.delete(`/wishes/${id}`);
}
