'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAnimalHistory,
  deleteAnimalHistory,
  getAnimalHistory,
  updateAnimalHistory,
} from '../api/animals-api';
import type { AnimalHistoryItem } from '../types/animal';
import { animalsQueryKey } from './use-animals';

export const animalHistoryQueryKey = (animalId: number, item: AnimalHistoryItem) =>
  ['animals', animalId, 'history', item] as const;

type HistoryMutation = {
  item: AnimalHistoryItem;
  value?: string | number | null;
  unity?: string | null;
  datemodification?: string | null;
};

export function useAnimalHistory(animalId: number | undefined, item: AnimalHistoryItem) {
  const queryClient = useQueryClient();
  const id = animalId ?? 0;
  const queryKey = animalHistoryQueryKey(id, item);
  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey }),
      queryClient.invalidateQueries({ queryKey: animalsQueryKey }),
    ]);
  };
  const query = useQuery({
    queryKey,
    queryFn: () => getAnimalHistory(id, item),
    enabled: id > 0,
    staleTime: 60_000,
  });
  const create = useMutation({
    mutationFn: (input: Omit<HistoryMutation, 'item'>) => createAnimalHistory(id, { ...input, item }),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ historyId, input }: { historyId: number; input: Omit<HistoryMutation, 'item'> }) =>
      updateAnimalHistory(id, historyId, { ...input, item }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (historyId: number) => deleteAnimalHistory(id, item, historyId),
    onSuccess: invalidate,
  });

  return {
    entries: query.data ?? [],
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createEntry: create.mutateAsync,
    updateEntry: update.mutateAsync,
    deleteEntry: remove.mutateAsync,
    isMutating: create.isPending || update.isPending || remove.isPending,
  };
}
