'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createGroup,
  deleteGroup,
  getGroupAnimals,
  getGroups,
  getInvitations,
  getPendingAnimalShares,
  inviteMembers,
  proposeAnimals,
  removeGroupAnimal,
  removeGroupMember,
  respondAnimalShare,
  respondInvitation,
  updateGroup,
} from '../api/groups-api';
import type {
  CreateGroupInput,
  DeleteMemberInput,
  Group,
  GroupInvitation,
  InviteMembersInput,
  PendingAnimalShare,
  ProposeAnimalsInput,
  RespondAnimalShareInput,
  RespondInvitationInput,
  UpdateGroupInput,
} from '../types/group';

export const groupsQueryKey = ['groups'] as const;
export const invitationsQueryKey = ['groups', 'invitations'] as const;
export const groupAnimalsQueryKey = (groupId: number) => ['groups', groupId, 'animals'] as const;
export const pendingAnimalSharesQueryKey = (groupId: number) => ['groups', groupId, 'animal-shares', 'pending'] as const;

function replaceGroup(current: Group[] | undefined, group: Group) {
  return (current ?? []).map((item) => item.id === group.id ? group : item);
}

export function useGroupsQuery() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: groupsQueryKey, queryFn: getGroups, staleTime: 30_000 });
  const create = useMutation({
    mutationFn: createGroup,
    onSuccess: (group) => queryClient.setQueryData<Group[]>(groupsQueryKey, (current = []) => [...current, group]),
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateGroupInput }) => updateGroup(id, input),
    onSuccess: (group) => queryClient.setQueryData<Group[]>(groupsQueryKey, (current) => replaceGroup(current, group)),
  });
  const remove = useMutation({
    mutationFn: deleteGroup,
    onSuccess: (_result, id) => queryClient.setQueryData<Group[]>(groupsQueryKey, (current = []) =>
      current.filter((group) => group.id !== id)),
  });

  return {
    groups: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    createGroup: (input: CreateGroupInput) => create.mutateAsync(input),
    updateGroup: (id: number, input: UpdateGroupInput) => update.mutateAsync({ id, input }),
    deleteGroup: (id: number) => remove.mutateAsync(id),
    refetch: query.refetch,
    isMutating: create.isPending || update.isPending || remove.isPending,
  };
}

export function useGroupInvitationsQuery() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: invitationsQueryKey, queryFn: getInvitations, staleTime: 30_000 });
  const respond = useMutation({
    mutationFn: ({ id, input }: { id: number; input: RespondInvitationInput }) => respondInvitation(id, input),
    onSuccess: (group, variables) => {
      queryClient.setQueryData(groupsQueryKey, (current: Group[] = []) =>
        group ? (current.some((item) => item.id === group.id) ? replaceGroup(current, group) : [...current, group]) : current,
      );
      queryClient.setQueryData<GroupInvitation[]>(invitationsQueryKey, (current = []) =>
        current.filter((invitation) => invitation.id !== variables.id),
      );
    },
  });
  return {
    invitations: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    respondInvitation: (id: number, input: RespondInvitationInput) => respond.mutateAsync({ id, input }),
    refetch: query.refetch,
    isMutating: respond.isPending,
  };
}

export function useGroupManagement(groupId: number) {
  const queryClient = useQueryClient();
  const refreshGroup = (group: Group) => queryClient.setQueryData<Group[]>(
    groupsQueryKey,
    (current) => replaceGroup(current, group),
  );
  const invite = useMutation({
    mutationFn: (input: InviteMembersInput) => inviteMembers(groupId, input),
    onSuccess: refreshGroup,
  });
  const propose = useMutation({
    mutationFn: (input: ProposeAnimalsInput) => proposeAnimals(groupId, input),
    onSuccess: (group) => {
      refreshGroup(group);
      void queryClient.invalidateQueries({ queryKey: pendingAnimalSharesQueryKey(groupId) });
    },
  });
  const removeAnimal = useMutation({
    mutationFn: (animalId: number) => removeGroupAnimal(groupId, animalId),
    onSuccess: (group) => {
      refreshGroup(group);
      void queryClient.invalidateQueries({ queryKey: groupAnimalsQueryKey(groupId) });
    },
  });
  const removeMember = useMutation({
    mutationFn: (input: DeleteMemberInput) => removeGroupMember(groupId, input),
    onSuccess: (group) => {
      if (group) refreshGroup(group);
      else queryClient.setQueryData<Group[]>(groupsQueryKey, (current = []) => current.filter((item) => item.id !== groupId));
    },
  });
  return {
    inviteMembers: invite.mutateAsync,
    proposeAnimals: propose.mutateAsync,
    removeAnimal: removeAnimal.mutateAsync,
    removeMember: removeMember.mutateAsync,
    isMutating: invite.isPending || propose.isPending || removeAnimal.isPending || removeMember.isPending,
  };
}

export function useGroupAnimalsQuery(groupId: number) {
  return useQuery({ queryKey: groupAnimalsQueryKey(groupId), queryFn: () => getGroupAnimals(groupId), enabled: groupId > 0 });
}

export function usePendingAnimalSharesQuery(groupId: number) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: pendingAnimalSharesQueryKey(groupId),
    queryFn: () => getPendingAnimalShares(groupId),
    enabled: groupId > 0,
  });
  const respond = useMutation({
    mutationFn: ({ id, input }: { id: number; input: RespondAnimalShareInput }) => respondAnimalShare(id, input),
    onSuccess: (group, variables) => {
      queryClient.setQueryData<Group[]>(groupsQueryKey, (current) => replaceGroup(current, group));
      queryClient.setQueryData<PendingAnimalShare[]>(pendingAnimalSharesQueryKey(groupId), (current = []) =>
        current.filter((share) => share.id !== variables.id),
      );
      void queryClient.invalidateQueries({ queryKey: groupAnimalsQueryKey(groupId) });
    },
  });
  return {
    ...query,
    shares: query.data,
    respondAnimalShare: (id: number, input: RespondAnimalShareInput) => respond.mutateAsync({ id, input }),
    isMutating: respond.isPending,
  };
}
