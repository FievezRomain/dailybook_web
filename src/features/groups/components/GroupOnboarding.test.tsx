import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GroupOnboarding } from './GroupOnboarding';

const mocks = vi.hoisted(() => ({
  currentUser: vi.fn(),
  groups: vi.fn(),
  invitations: vi.fn(),
}));

vi.mock('@/features/user/hooks/use-current-user', () => ({ useCurrentUser: mocks.currentUser }));
vi.mock('../hooks/use-groups', () => ({
  useGroupsQuery: mocks.groups,
  useGroupInvitationsQuery: mocks.invitations,
}));

describe('GroupOnboarding', () => {
  beforeEach(() => {
    mocks.groups.mockReturnValue({ groups: [], isLoading: false, isError: false });
    mocks.invitations.mockReturnValue({ invitations: [], isLoading: false, isError: false });
  });

  it('oriente un gestionnaire Premium sans introduire de surface marketing', () => {
    mocks.currentUser.mockReturnValue({ isPremium: true, isLoading: false });

    render(<GroupOnboarding />);

    expect(screen.getByRole('heading', { name: 'Coordonner un suivi à plusieurs' })).toBeVisible();
    expect(screen.getByText(/Utilisez Créer/)).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Créer un groupe' })).not.toBeInTheDocument();
    expect(screen.queryByText(/tarif|abonnement|comparatif/i)).not.toBeInTheDocument();
  });

  it('rappelle les droits réels d’un membre Essentiel', () => {
    mocks.currentUser.mockReturnValue({ isPremium: false, isLoading: false });

    render(<GroupOnboarding />);

    expect(screen.getByText(/rejoindre un groupe sur invitation/i)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Voir mes invitations' })).toHaveAttribute('href', '/groups');
  });

  it('se masque dès qu’une ressource groupe existe ou est en erreur', () => {
    mocks.currentUser.mockReturnValue({ isPremium: true, isLoading: false });
    mocks.groups.mockReturnValue({ groups: [{ id: 1 }], isLoading: false, isError: false });
    const { rerender } = render(<GroupOnboarding />);
    expect(screen.queryByRole('heading', { name: 'Coordonner un suivi à plusieurs' })).not.toBeInTheDocument();

    mocks.groups.mockReturnValue({ groups: [], isLoading: false, isError: true });
    rerender(<GroupOnboarding />);
    expect(screen.queryByRole('heading', { name: 'Coordonner un suivi à plusieurs' })).not.toBeInTheDocument();
  });
});
