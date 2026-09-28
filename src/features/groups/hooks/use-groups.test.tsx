import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  getGroups: vi.fn(), createGroup: vi.fn(), updateGroup: vi.fn(), deleteGroup: vi.fn(),
  getInvitations: vi.fn(), respondInvitation: vi.fn(), inviteMembers: vi.fn(), proposeAnimals: vi.fn(),
  removeGroupAnimal: vi.fn(), removeGroupMember: vi.fn(), getGroupAnimals: vi.fn(),
  getPendingAnimalShares: vi.fn(), respondAnimalShare: vi.fn(),
}));
vi.mock('../api/groups-api', () => api);

import {
  groupAnimalsQueryKey, groupsQueryKey, invitationsQueryKey, pendingAnimalSharesQueryKey,
  useGroupAnimalsQuery, useGroupInvitationsQuery, useGroupManagement, useGroupsQuery,
  usePendingAnimalSharesQuery,
} from './use-groups';

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

const first = { id: 1, name: 'Écurie', members: [], animals: [] };
const second = { id: 2, name: 'Famille', members: [], animals: [] };

describe('use-groups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getGroups.mockResolvedValue([first]);
    api.getInvitations.mockResolvedValue([]);
    api.getGroupAnimals.mockResolvedValue([]);
    api.getPendingAnimalShares.mockResolvedValue([]);
  });

  it('ajoute, remplace puis supprime un groupe dans le cache', async () => {
    const { client, wrapper } = setup();
    api.createGroup.mockResolvedValue(second);
    api.updateGroup.mockResolvedValue({ ...first, name: 'Écurie Vasco' });
    api.deleteGroup.mockResolvedValue(undefined);
    const { result } = renderHook(() => useGroupsQuery(), { wrapper });
    await waitFor(() => expect(result.current.groups).toEqual([first]));

    await act(async () => { await result.current.createGroup({ name: 'Famille' } as never); });
    await act(async () => { await result.current.updateGroup(1, { name: 'Écurie Vasco' } as never); });
    await act(async () => { await result.current.deleteGroup(2); });

    expect(client.getQueryData(groupsQueryKey)).toEqual([{ ...first, name: 'Écurie Vasco' }]);
  });

  it('traite une invitation et actualise les deux caches', async () => {
    const { client, wrapper } = setup();
    const invitation = { id: 9, group_id: 2 };
    client.setQueryData(invitationsQueryKey, [invitation]);
    client.setQueryData(groupsQueryKey, [first]);
    api.respondInvitation.mockResolvedValue(second);
    const { result } = renderHook(() => useGroupInvitationsQuery(), { wrapper });

    await act(async () => { await result.current.respondInvitation(9, { status: 'accepted' } as never); });

    expect(client.getQueryData(groupsQueryKey)).toEqual([first, second]);
    expect(client.getQueryData(invitationsQueryKey)).toEqual([]);
  });

  it('gère les membres et animaux en invalidant les vues concernées', async () => {
    const { client, wrapper } = setup();
    client.setQueryData(groupsQueryKey, [first]);
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    api.inviteMembers.mockResolvedValue(first);
    api.proposeAnimals.mockResolvedValue(first);
    api.removeGroupAnimal.mockResolvedValue(first);
    api.removeGroupMember.mockResolvedValue(undefined);
    const { result } = renderHook(() => useGroupManagement(1), { wrapper });

    await act(async () => { await result.current.inviteMembers({ emails: ['ami@example.com'] } as never); });
    await act(async () => { await result.current.proposeAnimals({ animalIds: [3] } as never); });
    await act(async () => { await result.current.removeAnimal(3); });
    await act(async () => { await result.current.removeMember({ userId: 5 } as never); });

    expect(client.getQueryData(groupsQueryKey)).toEqual([]);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: pendingAnimalSharesQueryKey(1) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: groupAnimalsQueryKey(1) });
  });

  it('charge les animaux et accepte un partage en attente', async () => {
    const { client, wrapper } = setup();
    const share = { id: 7, animal_id: 3 };
    api.getGroupAnimals.mockResolvedValue([{ id: 3 }]);
    api.getPendingAnimalShares.mockResolvedValue([share]);
    api.respondAnimalShare.mockResolvedValue(first);
    const animalsHook = renderHook(() => useGroupAnimalsQuery(1), { wrapper });
    const sharesHook = renderHook(() => usePendingAnimalSharesQuery(1), { wrapper });
    await waitFor(() => expect(animalsHook.result.current.data).toEqual([{ id: 3 }]));
    await waitFor(() => expect(sharesHook.result.current.shares).toEqual([share]));

    await act(async () => { await sharesHook.result.current.respondAnimalShare(7, { status: 'accepted' } as never); });

    expect(client.getQueryData(pendingAnimalSharesQueryKey(1))).toEqual([]);
  });
});
