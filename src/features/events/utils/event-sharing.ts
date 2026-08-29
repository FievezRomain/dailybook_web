import type { Animal } from '@/features/animals/types/animal';
import type { Group } from '@/features/groups/types/group';

function acceptedAnimalIds(group: Group): Set<number> {
  const accepted = group.data.animals.find((bucket) => bucket.type === 'accepted');
  return new Set(accepted?.items.map((animal) => animal.id) ?? []);
}

export function getEligibleEventGroups(groups: readonly Group[], animalIds: readonly number[]): Group[] {
  if (!animalIds.length) return [];
  return groups.filter((group) => {
    const accepted = acceptedAnimalIds(group);
    return animalIds.every((animalId) => accepted.has(animalId));
  });
}

export function getAnimalsAcceptedInEveryGroup(
  animals: readonly Animal[], groups: readonly Group[], groupIds: readonly number[],
): Animal[] {
  if (!groupIds.length) return [...animals];
  const selectedGroups = groupIds.map((id) => groups.find((group) => group.id === id));
  if (selectedGroups.some((group) => !group)) return [];
  const acceptedSets = selectedGroups.map((group) => acceptedAnimalIds(group!));
  return animals.filter((animal) => acceptedSets.every((accepted) => accepted.has(animal.id)));
}
