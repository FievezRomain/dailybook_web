import { beforeEach, describe, expect, it, vi } from 'vitest';

const client = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn(),
}));

vi.mock('@/shared/api/web-api-client', () => ({ webApiClient: client }));

import {
  createGroup, deleteGroup, getGroupAnimals, getGroups, getInvitations,
  getPendingAnimalShares, inviteMembers, proposeAnimals, removeGroupAnimal,
  removeGroupMember, respondAnimalShare, respondInvitation, updateGroup,
} from './groups-api';

const group = {
  id: 7, name: 'Écurie Vasco', informations: null, active: true,
  nb_members: 1, nb_animaux: 0,
  data: {
    animals: [{ type: 'pending', items: [] }, { type: 'accepted', items: [] }],
    members: [{ type: 'pending', items: [] }, { type: 'accepted', items: [] }],
  },
};

describe('groups-api', () => {
  beforeEach(() => vi.clearAllMocks());

  it('valide les lectures des groupes, invitations, animaux et propositions', async () => {
    client.get
      .mockResolvedValueOnce({ data: [group] })
      .mockResolvedValueOnce({ data: [{ id: 2, group_id: 7, email: 'membre@vasco.test', proposed_by: 1, status: 'pending', group_name: 'Écurie Vasco' }] })
      .mockResolvedValueOnce({ data: [{ id: 3, nom: 'Aria', espece: 'Cheval' }] })
      .mockResolvedValueOnce({ data: [{ id: 4, group_id: 7, animal_id: 3, proposed_by: 1, status: 'pending', animal_name: 'Aria' }] });

    await expect(getGroups()).resolves.toEqual([group]);
    await expect(getInvitations()).resolves.toHaveLength(1);
    await expect(getGroupAnimals(7)).resolves.toEqual([{ id: 3, nom: 'Aria', espece: 'Cheval' }]);
    await expect(getPendingAnimalShares(7)).resolves.toHaveLength(1);
    expect(client.get.mock.calls.map(([url]) => url)).toEqual([
      '/groups', '/invitations', '/groups/7/animals', '/groups/7/animal-shares/pending',
    ]);
  });

  it('transmet toutes les mutations de gestion et valide leurs réponses', async () => {
    client.post.mockResolvedValue({ data: group });
    client.put.mockResolvedValue({ data: group });
    client.patch.mockResolvedValue({ data: group });
    client.delete
      .mockResolvedValueOnce({ data: undefined })
      .mockResolvedValueOnce({ data: group })
      .mockResolvedValueOnce({ data: { message: 'groupe quitté' } });

    await expect(createGroup({ name: 'Écurie Vasco' })).resolves.toEqual(group);
    await expect(updateGroup(7, { name: 'Écurie Vasco' })).resolves.toEqual(group);
    await expect(inviteMembers(7, { members: ['membre@vasco.test'] })).resolves.toEqual(group);
    await expect(proposeAnimals(7, { animals: [3] })).resolves.toEqual(group);
    await expect(respondInvitation(2, { status: 'accepted' })).resolves.toEqual(group);
    await expect(respondAnimalShare(4, { status: 'accepted' })).resolves.toEqual(group);
    await expect(deleteGroup(7)).resolves.toBeUndefined();
    await expect(removeGroupAnimal(7, 3)).resolves.toEqual(group);
    await expect(removeGroupMember(7, { email: 'membre@vasco.test' })).resolves.toBeNull();

    expect(client.delete).toHaveBeenNthCalledWith(1, '/groups/7');
    expect(client.delete).toHaveBeenNthCalledWith(2, '/groups/7/animals/3');
    expect(client.delete).toHaveBeenNthCalledWith(3, '/groups/7/members', { data: { email: 'membre@vasco.test' } });
  });
});
