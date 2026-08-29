'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createObjective, deleteObjective, getObjectives, updateObjective, updateObjectiveSubtaskState,
} from '../api/objectives-api';
import type { CreateObjectiveInput, Objective, UpdateObjectiveInput } from '../types/objective';

export const objectivesQueryKey = ['objectives'] as const;

export function useObjectivesQuery() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: objectivesQueryKey, queryFn: getObjectives, staleTime: 30_000 });
  const replace = (objective: Objective) => queryClient.setQueryData<Objective[]>(
    objectivesQueryKey,
    (current = []) => current.map((item) => item.id === objective.id ? objective : item),
  );
  const create = useMutation({
    mutationFn: createObjective,
    onSuccess: (objective) => queryClient.setQueryData<Objective[]>(objectivesQueryKey, (current = []) => [...current, objective]),
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateObjectiveInput }) => updateObjective(id, input),
    onSuccess: replace,
  });
  const updateSubtask = useMutation({
    mutationFn: ({ objectiveId, subtaskId, state }: { objectiveId: number; subtaskId: number; state: boolean }) =>
      updateObjectiveSubtaskState(objectiveId, subtaskId, { state }),
    onSuccess: (subtask, variables) => queryClient.setQueryData<Objective[]>(
      objectivesQueryKey,
      (current = []) => current.map((objective) => objective.id === variables.objectiveId
        ? { ...objective, sousetapes: objective.sousetapes.map((item) => item.id === subtask.id ? { ...item, state: subtask.state } : item) }
        : objective),
    ),
  });
  const remove = useMutation({
    mutationFn: deleteObjective,
    onSuccess: (_result, id) => queryClient.setQueryData<Objective[]>(
      objectivesQueryKey,
      (current = []) => current.filter((objective) => objective.id !== id),
    ),
  });

  return {
    objectives: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    createObjective: (input: CreateObjectiveInput) => create.mutateAsync(input),
    updateObjective: (id: number, input: UpdateObjectiveInput) => update.mutateAsync({ id, input }),
    updateSubtaskState: (objectiveId: number, subtaskId: number, state: boolean) =>
      updateSubtask.mutateAsync({ objectiveId, subtaskId, state }),
    deleteObjective: (id: number) => remove.mutateAsync(id),
    isMutating: create.isPending || update.isPending || updateSubtask.isPending || remove.isPending,
  };
}
