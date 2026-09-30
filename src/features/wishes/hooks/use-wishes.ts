'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createWish, deleteWish, getWishes, updateWish } from '../api/wishes-api';
import { fileDownloadKey, type FileDownloadRequest } from '@/shared/api/file-download-contract';
import { getFileDownloadUrls } from '@/shared/api/file-downloads';
import type { CreateWishInput, UpdateWishInput, Wish } from '../types/wish';

export const wishesQueryKey = ['wishes'] as const;

async function getWishesWithImages(): Promise<Wish[]> {
  const wishes = await getWishes();
  const requests = wishes.flatMap((wish): FileDownloadRequest[] => wish.image ? [{
    fileName: wish.image, resourceType: 'wish', resourceId: wish.id,
  }] : []);
  if (!requests.length) return wishes;
  try {
    const urls = await getFileDownloadUrls(requests);
    const expiresAt = Date.now() + 4.5 * 60_000;
    return wishes.map((wish) => {
      if (!wish.image) return wish;
      const url = urls.get(fileDownloadKey({ fileName: wish.image, resourceType: 'wish', resourceId: wish.id }));
      return url ? { ...wish, imageSigned: { url, expiresAt } } : wish;
    });
  } catch {
    return wishes;
  }
}

export function useWishesQuery() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: wishesQueryKey, queryFn: getWishesWithImages, staleTime: 30_000 });
  const create = useMutation({
    mutationFn: createWish,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wishesQueryKey }),
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateWishInput }) => updateWish(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wishesQueryKey }),
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
