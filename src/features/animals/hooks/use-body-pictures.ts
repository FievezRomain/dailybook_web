'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ImageSigned } from '@/types/image';
import { createBodyPicture, deleteBodyPicture, getBodyPictures } from '../api/animals-api';
import { deleteAnimalFile, getAnimalFileUrl, uploadAnimalFile } from '../api/animal-files';
import type { AnimalBodyPicture } from '../types/animal';

export const bodyPicturesQueryKey = (animalId: number) => ['animals', animalId, 'body-pictures'] as const;

async function withUrl(picture: AnimalBodyPicture) {
  try {
    const url = await getAnimalFileUrl(picture.filename, 'body', picture.idanimal);
    return { ...picture, imageSigned: { url, expiresAt: Date.now() + 4.5 * 60_000 } };
  } catch {
    return picture;
  }
}

export function useBodyPictures(animalId: number | undefined, enabled: boolean) {
  const queryClient = useQueryClient();
  const id = animalId ?? 0;
  const query = useQuery({
    queryKey: bodyPicturesQueryKey(id),
    queryFn: async () => Promise.all((await getBodyPictures(id)).map(withUrl)),
    enabled: enabled && id > 0,
    staleTime: 60_000,
  });
  const add = useMutation({
    mutationFn: async ({ file, date }: { file: File; date: string }) => {
      const filename = await uploadAnimalFile(file, 'body', id);
      try {
        return await createBodyPicture(id, filename, date);
      } catch (error) {
        await deleteAnimalFile(filename, 'body', id).catch(() => undefined);
        throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bodyPicturesQueryKey(id) }),
  });
  const remove = useMutation({
    mutationFn: async (picture: AnimalBodyPicture) => {
      await deleteBodyPicture(picture.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bodyPicturesQueryKey(id) }),
  });

  const updatePictureUrl = (pictureId: number, imageSigned: ImageSigned) => {
    queryClient.setQueryData<AnimalBodyPicture[]>(bodyPicturesQueryKey(id), (pictures) =>
      pictures?.map((picture) => picture.id === pictureId ? { ...picture, imageSigned } : picture));
  };

  return {
    pictures: query.data ?? [],
    isLoading: query.isPending && query.isFetching,
    error: query.error,
    addPicture: add.mutateAsync,
    deletePicture: remove.mutateAsync,
    updatePictureUrl,
    refetch: query.refetch,
    isMutating: add.isPending || remove.isPending,
  };
}
