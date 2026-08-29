'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ImageSigned } from '@/types/image';
import { createAnimal, deleteAnimal, getAnimals, updateAnimal } from '../api/animals-api';
import { deleteAnimalFile, getAnimalFileUrl, uploadAnimalFile } from '../api/animal-files';
import type { Animal, CreateAnimalInput, UpdateAnimalInput } from '../types/animal';

export const animalsQueryKey = ['animals'] as const;

async function withPicture(animal: Animal): Promise<Animal> {
  if (!animal.image) return animal;
  try {
    const url = await getAnimalFileUrl(animal.image, 'animal', animal.id);
    return { ...animal, imageSigned: { url, expiresAt: Date.now() + 4.5 * 60_000 } };
  } catch {
    return animal;
  }
}

export function useAnimalsQuery() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: animalsQueryKey,
    queryFn: async () => Promise.all((await getAnimals()).map(withPicture)),
    staleTime: 60_000,
  });
  const create = useMutation({ mutationFn: createAnimal, onSuccess: () => queryClient.invalidateQueries({ queryKey: animalsQueryKey }) });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateAnimalInput }) => updateAnimal(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: animalsQueryKey }),
  });
  const remove = useMutation({ mutationFn: deleteAnimal, onSuccess: () => queryClient.invalidateQueries({ queryKey: animalsQueryKey }) });

  const updateAnimalImage = (id: number, imageSigned: ImageSigned) => {
    queryClient.setQueryData<Animal[]>(animalsQueryKey, (animals) =>
      animals?.map((animal) => animal.id === id ? { ...animal, imageSigned } : animal));
  };

  async function createWithPicture(input: CreateAnimalInput, picture?: File) {
    const created = await create.mutateAsync({ ...input, image: undefined });
    if (picture) {
      const filename = await uploadAnimalFile(picture, 'animal', created.id);
      try {
        await update.mutateAsync({ id: created.id, input: { image: filename } });
      } catch (error) {
        await deleteAnimalFile(filename, 'animal', created.id).catch(() => undefined);
        throw error;
      }
    }
    return created;
  }

  async function updateWithPicture(id: number, input: UpdateAnimalInput, picture?: File) {
    let image = input.image;
    if (!picture) return update.mutateAsync({ id, input: { ...input, image } });
    image = await uploadAnimalFile(picture, 'animal', id);
    try {
      return await update.mutateAsync({ id, input: { ...input, image } });
    } catch (error) {
      await deleteAnimalFile(image, 'animal', id).catch(() => undefined);
      throw error;
    }
  }

  return {
    animals: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    createAnimal: createWithPicture,
    updateAnimal: updateWithPicture,
    deleteAnimal: remove.mutateAsync,
    updateAnimalImage,
    refetch: query.refetch,
    isMutating: create.isPending || update.isPending || remove.isPending,
  };
}
