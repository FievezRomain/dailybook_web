import { webApiClient } from '@/shared/api/web-api-client';
import { contactListSchema, contactSchema } from '../schemas/contact';
import type { CreateContactInput, UpdateContactInput } from '../types/contact';

export async function getContacts() {
  return contactListSchema.parse((await webApiClient.get('/contacts')).data);
}

export async function createContact(input: CreateContactInput) {
  return contactSchema.parse((await webApiClient.post('/contacts', input)).data);
}

export async function updateContact(id: number, input: UpdateContactInput) {
  return contactSchema.parse((await webApiClient.put(`/contacts/${id}`, input)).data);
}

export async function deleteContact(id: number) {
  await webApiClient.delete(`/contacts/${id}`);
}
