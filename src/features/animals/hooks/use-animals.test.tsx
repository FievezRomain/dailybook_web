import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  getAnimals: vi.fn(), createAnimal: vi.fn(), updateAnimal: vi.fn(), deleteAnimal: vi.fn(),
  getAnimalFileUrl: vi.fn(), uploadAnimalFile: vi.fn(), deleteAnimalFile: vi.fn(),
}));
vi.mock('../api/animals-api', () => ({
  getAnimals: api.getAnimals, createAnimal: api.createAnimal,
  updateAnimal: api.updateAnimal, deleteAnimal: api.deleteAnimal,
}));
vi.mock('../api/animal-files', () => ({
  getAnimalFileUrl: api.getAnimalFileUrl, uploadAnimalFile: api.uploadAnimalFile,
  deleteAnimalFile: api.deleteAnimalFile,
}));

import { animalsQueryKey, useAnimalsQuery } from './use-animals';

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

const animal = { id: 3, nom: 'Vasco', espece: 'Cheval', provenance: 'owner' };

describe('use-animals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getAnimals.mockResolvedValue([animal]);
    api.createAnimal.mockResolvedValue(animal);
    api.updateAnimal.mockResolvedValue(animal);
    api.deleteAnimal.mockResolvedValue(undefined);
  });

  it('signe les photos disponibles sans bloquer la liste en cas d’échec', async () => {
    api.getAnimals.mockResolvedValue([
      animal,
      { ...animal, id: 4, image: 'portrait.jpg' },
      { ...animal, id: 5, image: 'indisponible.jpg' },
    ]);
    api.getAnimalFileUrl
      .mockResolvedValueOnce('https://storage.example/portrait.jpg')
      .mockRejectedValueOnce(new Error('signature expirée'));
    const { wrapper } = setup();
    const { result } = renderHook(() => useAnimalsQuery(), { wrapper });

    await waitFor(() => expect(result.current.animals).toHaveLength(3));
    expect(result.current.animals?.[1].imageSigned?.url).toContain('storage.example');
    expect(result.current.animals?.[2].imageSigned).toBeUndefined();
  });

  it('crée, modifie et supprime un animal avec sa photo', async () => {
    const { wrapper } = setup();
    const file = new File(['image'], 'vasco.jpg', { type: 'image/jpeg' });
    api.uploadAnimalFile.mockResolvedValue('stored.jpg');
    const { result } = renderHook(() => useAnimalsQuery(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => { await result.current.createAnimal({ nom: 'Vasco' } as never, file); });
    await act(async () => { await result.current.updateAnimal(3, { nom: 'Vasco II' } as never, file); });
    await act(async () => { await result.current.deleteAnimal(3); });

    expect(api.uploadAnimalFile).toHaveBeenCalledTimes(2);
    expect(api.updateAnimal).toHaveBeenCalledWith(3, expect.objectContaining({ image: 'stored.jpg' }));
    expect(api.deleteAnimal.mock.calls[0]?.[0]).toBe(3);
  });

  it('met à jour immédiatement l’image en cache et nettoie un transfert si la sauvegarde échoue', async () => {
    const { client, wrapper } = setup();
    const file = new File(['image'], 'vasco.jpg', { type: 'image/jpeg' });
    api.uploadAnimalFile.mockResolvedValue('orphan.jpg');
    api.updateAnimal.mockRejectedValue(new Error('mise à jour refusée'));
    api.deleteAnimalFile.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAnimalsQuery(), { wrapper });
    await waitFor(() => expect(result.current.animals).toEqual([animal]));

    act(() => result.current.updateAnimalImage(3, { url: 'https://storage.example/new.jpg', expiresAt: 42 }));
    expect((client.getQueryData(animalsQueryKey) as Array<{ imageSigned?: { url: string } }>)[0].imageSigned?.url)
      .toContain('new.jpg');
    await expect(result.current.updateAnimal(3, { nom: 'Vasco' } as never, file)).rejects.toThrow('refusée');
    expect(api.deleteAnimalFile).toHaveBeenCalledWith('orphan.jpg', 'animal', 3);
  });
});
