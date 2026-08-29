import { webApiClient } from '@/shared/api/web-api-client';
import { objectiveListSchema, objectiveSchema, subtaskStateResponseSchema } from '../schemas/objective';
import type { CreateObjectiveInput, SubtaskStateInput, UpdateObjectiveInput } from '../types/objective';

export async function getObjectives() {
  return objectiveListSchema.parse((await webApiClient.get('/objectifs')).data);
}

export async function createObjective(input: CreateObjectiveInput) {
  return objectiveSchema.parse((await webApiClient.post('/objectifs', input)).data);
}

export async function updateObjective(id: number, input: UpdateObjectiveInput) {
  return objectiveSchema.parse((await webApiClient.put(`/objectifs/${id}`, input)).data);
}

export async function updateObjectiveSubtaskState(
  objectiveId: number,
  subtaskId: number,
  input: SubtaskStateInput,
) {
  return subtaskStateResponseSchema.parse(
    (await webApiClient.patch(`/objectifs/${objectiveId}/subtasks/${subtaskId}`, input)).data,
  );
}

export async function deleteObjective(id: number) {
  await webApiClient.delete(`/objectifs/${id}`);
}
