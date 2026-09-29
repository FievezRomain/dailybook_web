import { webApiClient } from '@/shared/api/web-api-client';
import {
  groupAnimalListSchema,
  groupListSchema,
  groupSchema,
  invitationListSchema,
  memberMutationResponseSchema,
  optionalGroupResponseSchema,
  pendingAnimalShareListSchema,
} from '../schemas/group';
import type {
  CreateGroupInput,
  DeleteMemberInput,
  InviteMembersInput,
  ProposeAnimalsInput,
  RespondAnimalShareInput,
  RespondInvitationInput,
  UpdateGroupInput,
} from '../types/group';

export async function getGroups() {
  return groupListSchema.parse((await webApiClient.get('/groups')).data);
}

export async function createGroup(input: CreateGroupInput) {
  return groupSchema.parse((await webApiClient.post('/groups', input)).data);
}

export async function updateGroup(id: number, input: UpdateGroupInput) {
  return groupSchema.parse((await webApiClient.put(`/groups/${id}`, input)).data);
}

export async function deleteGroup(id: number) {
  await webApiClient.delete(`/groups/${id}`);
}

export async function inviteMembers(groupId: number, input: InviteMembersInput) {
  return groupSchema.parse((await webApiClient.post(`/groups/${groupId}/invitations`, input)).data);
}

export async function getInvitations() {
  return invitationListSchema.parse((await webApiClient.get('/invitations')).data);
}

export async function respondInvitation(id: number, input: RespondInvitationInput) {
  return optionalGroupResponseSchema.parse((await webApiClient.patch(`/invitations/${id}`, input)).data);
}

export async function getGroupAnimals(groupId: number) {
  return groupAnimalListSchema.parse((await webApiClient.get(`/groups/${groupId}/animals`)).data);
}

export async function proposeAnimals(groupId: number, input: ProposeAnimalsInput) {
  return groupSchema.parse((await webApiClient.post(`/groups/${groupId}/animals`, input)).data);
}

export async function getPendingAnimalShares(groupId: number) {
  return pendingAnimalShareListSchema.parse(
    (await webApiClient.get(`/groups/${groupId}/animal-shares/pending`)).data,
  );
}

export async function respondAnimalShare(id: number, input: RespondAnimalShareInput) {
  return groupSchema.parse((await webApiClient.patch(`/animal-shares/${id}`, input)).data);
}

export async function removeGroupAnimal(groupId: number, animalId: number) {
  return groupSchema.parse((await webApiClient.delete(`/groups/${groupId}/animals/${animalId}`)).data);
}

export async function removeGroupMember(groupId: number, input: DeleteMemberInput) {
  return memberMutationResponseSchema.parse(
    (await webApiClient.delete(`/groups/${groupId}/members`, { data: input })).data,
  );
}
