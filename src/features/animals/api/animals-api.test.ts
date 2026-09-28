import { beforeEach, describe, expect, it, vi } from 'vitest';

const client = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock('@/shared/api/web-api-client', () => ({ webApiClient: client }));

import {
  createAnimal, createAnimalHistory, createBodyPicture, deleteAnimal,
  deleteAnimalHistory, deleteBodyPicture, getAnimalHistory, getAnimals,
  getBodyPictures, updateAnimal, updateAnimalHistory,
} from './animals-api';

const animal = { id: 3, nom: 'Aria', espece: 'Cheval', provenance: 'owner' };
const picture = { id: 8, filename: `${'a'.repeat(32)}.jpg`, date_enregistrement: '2026-09-20', idanimal: 3 };

describe('animals-api', () => {
  beforeEach(() => vi.clearAllMocks());

  it('valide les lectures du profil, des historiques et des photos', async () => {
    client.get
      .mockResolvedValueOnce({ data: [animal] })
      .mockResolvedValueOnce({ data: [{ id: 4, idanimal: 3, value: 425, unity: 'kg', datemodification: '2026-09-20', item: 'poids' }] })
      .mockResolvedValueOnce({ data: [picture] });

    await expect(getAnimals()).resolves.toEqual([animal]);
    await expect(getAnimalHistory(3, 'poids')).resolves.toHaveLength(1);
    await expect(getBodyPictures(3)).resolves.toEqual([picture]);
    expect(client.get.mock.calls.map(([url]) => url)).toEqual([
      '/animals', '/animals/3/history/poids', '/animals/3/body-pictures',
    ]);
  });

  it('transmet les créations et modifications du profil et de son historique', async () => {
    client.post.mockResolvedValueOnce({ data: animal }).mockResolvedValueOnce({ data: animal }).mockResolvedValueOnce({ data: picture });
    client.put.mockResolvedValue({ data: animal });

    await expect(createAnimal({ nom: 'Aria' })).resolves.toEqual(animal);
    await expect(updateAnimal(3, { poids: 425 })).resolves.toEqual(animal);
    await expect(createAnimalHistory(3, { item: 'poids', value: 425, unity: 'kg' })).resolves.toEqual(animal);
    await expect(updateAnimalHistory(3, 4, { item: 'poids', value: 430 })).resolves.toEqual(animal);
    await expect(createBodyPicture(3, picture.filename, '2026-09-20')).resolves.toEqual(picture);

    expect(client.put).toHaveBeenCalledWith('/animals/3/history/poids/4', { item: 'poids', value: 430 });
    expect(client.post).toHaveBeenLastCalledWith('/animals/3/body-pictures', { filename: picture.filename, date_enregistrement: '2026-09-20' });
  });

  it('borne toutes les suppressions à la ressource demandée', async () => {
    client.delete.mockResolvedValue({});
    await deleteAnimal(3);
    await deleteAnimalHistory(3, 'poids', 4);
    await deleteBodyPicture(8);
    expect(client.delete.mock.calls.map(([url]) => url)).toEqual([
      '/animals/3', '/animals/3/history/poids/4', '/animals/body-pictures/8',
    ]);
  });
});
