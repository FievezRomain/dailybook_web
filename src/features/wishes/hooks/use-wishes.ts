'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createWish, deleteWish, getWishes, updateWish } from '../api/wishes-api';
import type { CreateWishInput, UpdateWishInput, Wish } from '../types/wish';

export const wishesQueryKey = ['wishes'] as const;

export function useWishesQuery() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: wishesQueryKey, queryFn: getWishes, staleTime: 30_000 });
  const create = useMutation({
    mutationFn: createWish,
    onSuccess: (wish) => queryClient.setQueryData<Wish[]>(wishesQueryKey, (current = []) => [...current, wish]),
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateWishInput }) => updateWish(id, input),
    onSuccess: (wish) => queryClient.setQueryData<Wish[]>(
      wishesQueryKey,
      (current = []) => current.map((item) => item.id === wish.id ? wish : item),
    ),
  });
  const remove = useMutation({
    mutationFn: deleteWish,
    onSuccess: (_result, id) => queryClient.setQueryData<Wish[]>(
      wishesQueryKey,
      (current = []) => current.filter((wish) => wish.id !== id),
    ),
  });

  return {
    wishes: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    createWish: (input: CreateWishInput) => create.mutateAsync(input),
    updateWish: (id: number, input: UpdateWishInput) => update.mutateAsync({ id, input }),
    deleteWish: (id: number) => remove.mutateAsync(id),
    refetch: query.refetch,
    isMutating: create.isPending || update.isPending || remove.isPending,
  };
}
