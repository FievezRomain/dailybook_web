import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GroupsContent from './GroupsContent';
import { PremiumDialogProvider } from '@/shared/components/feedback/PremiumGate';

const mocks = vi.hoisted(() => ({
  currentUser: vi.fn(),
  groups: vi.fn(),
  invitations: vi.fn(),
  detail: vi.fn(),
  respondInvitation: vi.fn(),
}));

vi.mock('@/features/user/hooks/use-current-user', () => ({ useCurrentUser: mocks.currentUser }));
vi.mock('../hooks/use-groups', () => ({
  useGroupsQuery: mocks.groups,
  useGroupInvitationsQuery: mocks.invitations,
}));
vi.mock('./GroupDetail', () => ({ GroupDetail: ({ group }: { group: { name: string } }) => { mocks.detail(group); return <div>Détail {group.name}</div>; } }));

const group = {
  id: 7, name: 'Écurie Vasco', informations: null, nb_members: 1, nb_animaux: 0,
  data: {
    animals: [{ type: 'pending' as const, items: [] }, { type: 'accepted' as const, items: [] }],
    members: [{ type: 'pending' as const, items: [] }, { type: 'accepted' as const, items: [{ user_id: 2, email: 'free@example.com', prenom: null, role: 'member' as const }] }],
  },
};

describe('GroupsContent', () => {
  beforeEach(() => {
    mocks.currentUser.mockReturnValue({ user: { id: 2, email: 'free@example.com' }, isPremium: false, isLoading: false });
    mocks.groups.mockReturnValue({ groups: [group], isLoading: false, isError: false, isMutating: false, createGroup: vi.fn(), updateGroup: vi.fn(), deleteGroup: vi.fn(), refetch: vi.fn() });
    mocks.respondInvitation.mockReset().mockResolvedValue(group);
    mocks.invitations.mockReturnValue({ invitations: [{ id: 4, group_id: 7, email: 'free@example.com', proposed_by: 1, status: 'pending', group_name: 'Écurie Vasco', proposed_by_name: 'Maya' }], isLoading: false, isError: false, isMutating: false, respondInvitation: mocks.respondInvitation, refetch: vi.fn() });
  });

  it('laisse un membre Gratuit consulter un groupe actif et accepter une invitation', async () => {
    render(<PremiumDialogProvider><GroupsContent /></PremiumDialogProvider>);
    expect(screen.getByText('Détail Écurie Vasco')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Accepter' }));
    await waitFor(() => expect(mocks.respondInvitation).toHaveBeenCalledWith(4, { status: 'accepted' }));
  });

  it('explique le verrou Premium au lieu de masquer la création', () => {
    render(<PremiumDialogProvider><GroupsContent /></PremiumDialogProvider>);
    fireEvent.click(screen.getByRole('button', { name: /Créer un groupe/ }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Gestion des groupes · Premium');
    expect(screen.getByRole('dialog')).toHaveTextContent('Un compte Gratuit peut toujours accepter une invitation');
    fireEvent.click(screen.getByRole('button', { name: 'Comparer les offres' }));
    expect(screen.getByLabelText('Comparatif des abonnements')).toHaveTextContent('Gratuit');
    expect(screen.getByLabelText('Comparatif des abonnements')).toHaveTextContent('Premium');
  });
});
