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
  id: 7, name: 'Écurie Vasco', active: true, informations: null, nb_members: 1, nb_animaux: 0,
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
    expect(screen.getByText('0 animaux')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Accepter' }));
    await waitFor(() => expect(mocks.respondInvitation).toHaveBeenCalledWith(4, { status: 'accepted' }));
  });

  it('ne duplique pas la création globale dans l’en-tête', () => {
    render(<PremiumDialogProvider><GroupsContent /></PremiumDialogProvider>);
    expect(screen.queryByRole('button', { name: /Créer un groupe/ })).not.toBeInTheDocument();
  });

  it('ouvre directement le formulaire après une création globale Premium', () => {
    mocks.currentUser.mockReturnValue({ user: { id: 2, email: 'premium@example.com' }, isPremium: true, isLoading: false });
    render(<PremiumDialogProvider><GroupsContent startCreating /></PremiumDialogProvider>);
    expect(screen.getByRole('dialog')).toHaveTextContent('Créer un groupe');
  });
});
