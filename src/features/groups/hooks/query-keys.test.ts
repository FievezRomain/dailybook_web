import { describe, expect, it } from 'vitest';

import {
  groupAnimalsQueryKey,
  groupsQueryKey,
  invitationsQueryKey,
  pendingAnimalSharesQueryKey,
} from './use-groups';

describe('clés de cache des groupes', () => {
  it('range les sous-ressources sous le domaine groups', () => {
    expect(groupsQueryKey).toEqual(['groups']);
    expect(invitationsQueryKey).toEqual(['groups', 'invitations']);
    expect(groupAnimalsQueryKey(7)).toEqual(['groups', 7, 'animals']);
    expect(pendingAnimalSharesQueryKey(7)).toEqual(['groups', 7, 'animal-shares', 'pending']);
  });
});
