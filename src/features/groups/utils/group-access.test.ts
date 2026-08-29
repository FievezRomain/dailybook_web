import { describe, expect, it } from 'vitest';
import type { Group } from '../types/group';
import { getAcceptedGroupMembers, getCurrentGroupRole, getGroupAnimals, getPendingGroupMembers } from './group-access';

const group: Group = {
  id: 7,
  name: 'Écurie Vasco',
  informations: null,
  nb_members: 2,
  nb_animaux: 2,
  data: {
    members: [
      { type: 'pending', items: [{ email: 'invitee@example.com' }] },
      { type: 'accepted', items: [
        { user_id: 1, email: 'manager@example.com', prenom: 'Maya', role: 'manager' },
        { user_id: 2, email: 'member@example.com', prenom: null, role: 'member' },
      ] },
    ],
    animals: [
      { type: 'pending', items: [{ id: 10, nom: 'Nova', espece: 'Cheval' }] },
      { type: 'accepted', items: [{ id: 11, nom: 'Vasco', espece: 'Chien' }] },
    ],
  },
};

describe('group access helpers', () => {
  it('sépare les états pending et accepted', () => {
    expect(getPendingGroupMembers(group)).toEqual([{ email: 'invitee@example.com' }]);
    expect(getAcceptedGroupMembers(group)).toHaveLength(2);
    expect(getGroupAnimals(group, 'pending')[0]?.id).toBe(10);
    expect(getGroupAnimals(group, 'accepted')[0]?.id).toBe(11);
  });

  it('identifie le rôle par identifiant ou email normalisé', () => {
    expect(getCurrentGroupRole(group, { id: 1, email: 'other@example.com' })).toBe('manager');
    expect(getCurrentGroupRole(group, { id: 99, email: 'MEMBER@example.com' })).toBe('member');
    expect(getCurrentGroupRole(group, { id: 99, email: 'outside@example.com' })).toBeNull();
  });
});
