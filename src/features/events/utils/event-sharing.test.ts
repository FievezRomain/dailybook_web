import { describe, expect, it } from 'vitest';
import type { Animal } from '@/features/animals/types/animal';
import type { Group } from '@/features/groups/types/group';
import { getAnimalsAcceptedInEveryGroup, getEligibleEventGroups } from './event-sharing';

function group(id: number, animalIds: number[]): Group {
  return {
    id, name: `Groupe ${id}`, nb_members: 1, nb_animaux: animalIds.length,
    data: {
      animals: [
        { type: 'pending', items: [] },
        { type: 'accepted', items: animalIds.map((animalId) => ({ id: animalId })) },
      ],
      members: [{ type: 'pending', items: [] }, { type: 'accepted', items: [] }],
    },
  };
}

const animals = [
  { id: 1, nom: 'Nala', provenance: 'owner' },
  { id: 2, nom: 'Moka', provenance: 'shared' },
  { id: 3, nom: 'Rio', provenance: 'owner' },
] satisfies Animal[];

describe('partage des événements', () => {
  it('ne propose que les groupes contenant tous les animaux sélectionnés', () => {
    const groups = [group(10, [1, 2]), group(11, [1]), group(12, [1, 2, 3])];
    expect(getEligibleEventGroups(groups, [1, 2]).map(({ id }) => id)).toEqual([10, 12]);
  });

  it('restreint les animaux à l’intersection des groupes destinataires', () => {
    expect(getAnimalsAcceptedInEveryGroup(animals, [group(10, [1, 2]), group(12, [1, 3])], [10, 12]))
      .toEqual([animals[0]]);
  });

  it('refuse silencieusement un groupe destinataire inconnu', () => {
    expect(getAnimalsAcceptedInEveryGroup(animals, [group(10, [1, 2])], [999])).toEqual([]);
  });
});
