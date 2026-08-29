import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const currentUser = vi.hoisted(() => vi.fn());
vi.mock('@/features/user/hooks/use-current-user', () => ({ useCurrentUser: currentUser }));
vi.mock('./UserPictureControl', () => ({
  UserPictureControl: () => <div data-testid="user-picture-control" />,
}));

import ProfileContent from './ProfileContent';

describe('ProfileContent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('présente un état de chargement explicite', () => {
    currentUser.mockReturnValue({ isLoading: true, isError: false });

    render(<ProfileContent />);

    expect(screen.getByRole('status')).toHaveTextContent('Chargement du profil…');
  });

  it('permet de relancer une lecture en erreur', () => {
    const refetch = vi.fn();
    currentUser.mockReturnValue({ isLoading: false, isError: true, refetch });

    render(<ProfileContent />);
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Le profil ne peut pas être chargé.');
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('affiche le profil sans monter les providers applicatifs', () => {
    currentUser.mockReturnValue({
      user: { name: 'Alice', email: 'alice@example.com' },
      isLoading: false,
      isError: false,
    });

    render(<ProfileContent />);

    expect(screen.getByRole('heading', { name: 'Espace compte' })).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByTestId('user-picture-control')).toBeInTheDocument();
  });
});
