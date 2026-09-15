import type { Group } from '../types/group';

export function getAcceptedGroupMembers(group: Group) {
  return group.data.members.find((bucket) => bucket.type === 'accepted')?.items ?? [];
}

export function getPendingGroupMembers(group: Group) {
  return group.data.members.find((bucket) => bucket.type === 'pending')?.items ?? [];
}

export function getGroupAnimals(group: Group, type: 'pending' | 'accepted') {
  return group.data.animals.find((bucket) => bucket.type === type)?.items ?? [];
}

export function getCurrentGroupRole(group: Group, user: { id: number; email: string } | undefined) {
  if (!user) return null;
  const member = getAcceptedGroupMembers(group).find(
    (item) => item.user_id === user.id || item.email.toLowerCase() === user.email.toLowerCase(),
  );
  return member?.role ?? null;
}

export function getGroupPermissions(group: Group, user: { id: number; email: string } | undefined, isPremium: boolean) {
  const role = getCurrentGroupRole(group, user);
  const active = group.active;

  return {
    active,
    role,
    canManage: active && role === 'manager' && isPremium,
    canProposeOwnAnimals: active && role !== null,
  };
}
