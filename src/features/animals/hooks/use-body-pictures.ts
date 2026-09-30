'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ImageSigned } from '@/types/image';
import { fileDownloadKey, type FileDownloadRequest } from '@/shared/api/file-download-contract';
import { getFileDownloadUrls } from '@/shared/api/file-downloads';
import { createBodyPicture, deleteBodyPicture, getBodyPictures } from '../api/animals-api';
import { deleteAnimalFile, uploadAnimalFile } from '../api/animal-files';
import type { AnimalBodyPicture } from '../types/animal';

export const bodyPicturesQueryKey = (animalId: number) => ['animals', animalId, 'body-pictures'] as const;

async function withUrls(pictures: AnimalBodyPicture[]) {
  const requests: FileDownloadRequest[] = pictures.map((picture) => ({
    fileName: picture.filename, resourceType: 'body', resourceId: picture.idanimal,
  }));
  if (!requests.length) return pictures;
  try {
    const urls = await getFileDownloadUrls(requests);
    const expiresAt = Date.now() + 4.5 * 60_000;
    return pictures.map((picture) => {
      const url = urls.get(fileDownloadKey({ fileName: picture.filename, resourceType: 'body', resourceId: picture.idanimal }));
      return url ? { ...picture, imageSigned: { url, expiresAt } } : picture;
    });
  } catch {
    return pictures;
  }
}

export function useBodyPictures(animalId: number | undefined, enabled: boolean) {
  const queryClient = useQueryClient();
  const id = animalId ?? 0;
  const query = useQuery({
    queryKey: bodyPicturesQueryKey(id),
    queryFn: async () => withUrls(await getBodyPictures(id)),
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
