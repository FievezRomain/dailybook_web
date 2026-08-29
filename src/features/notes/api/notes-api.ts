import { webApiClient } from '@/shared/api/web-api-client';
import { noteListSchema, noteSchema } from '../schemas/note';
import type { CreateNoteInput, UpdateNoteInput } from '../types/note';

export async function getNotes() {
  return noteListSchema.parse((await webApiClient.get('/notes')).data);
}

export async function createNote(input: CreateNoteInput) {
  return noteSchema.parse((await webApiClient.post('/notes', input)).data);
}

export async function updateNote(id: number, input: UpdateNoteInput) {
  return noteSchema.parse((await webApiClient.put(`/notes/${id}`, input)).data);
}

export async function deleteNote(id: number) {
  await webApiClient.delete(`/notes/${id}`);
}
