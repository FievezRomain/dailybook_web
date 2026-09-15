import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const currentUser = vi.hoisted(() => vi.fn());
const updateProfile = vi.hoisted(() => vi.fn());
const updatePreferences = vi.hoisted(() => vi.fn());
vi.mock('@/features/user/hooks/use-current-user', () => ({ useCurrentUser: currentUser }));
vi.mock('@/features/user/hooks/use-update-current-user', () => ({ useUpdateCurrentUser: () => ({ updateProfile, isPending: false, error: null }) }));
vi.mock('@/features/notifications/hooks/use-notifications', () => ({ useNotificationPreferencesMutation: () => ({ updatePreferences, isPending: false }) }));
vi.mock('./UserPictureControl', () => ({
  UserPictureControl: () => <div data-testid="user-picture-control" />,
}));

import ProfileContent from './ProfileContent';

describe('ProfileContent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('présente un état de chargement explicite', () => {
    currentUser.mockReturnValue({ isLoading: true, isError: false });

    render(<ProfileContent />);

    expect(screen.getByRole('status')).toHaveTextContent('Chargement du compte…');
  });

  it('permet de relancer une lecture en erreur', () => {
    const refetch = vi.fn();
    currentUser.mockReturnValue({ isLoading: false, isError: true, refetch });

    render(<ProfileContent />);
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Le compte ne peut pas être chargé.');
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('affiche le profil sans monter les providers applicatifs', () => {
    currentUser.mockReturnValue({
      user: { name: 'Alice', email: 'alice@example.com' },
      isLoading: false,
      isError: false,
    });

    render(<ProfileContent />);

    expect(screen.getByRole('heading', { name: 'Alice' })).toBeInTheDocument();
    expect(screen.getAllByText('alice@example.com')).toHaveLength(2);
    expect(screen.getByTestId('user-picture-control')).toBeInTheDocument();
  });

  it('envoie les modifications de profil via la mutation BFF', async () => {
    currentUser.mockReturnValue({ user: { name: 'Alice', email: 'alice@example.com' }, isLoading: false, isError: false });
    updateProfile.mockResolvedValue(undefined);
    render(<ProfileContent />);
    fireEvent.click(screen.getByRole('button', { name: /^Modifier$/ }));
    fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Alicia' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    await waitFor(() => expect(updateProfile).toHaveBeenCalledWith({ prenom: 'Alicia' }));
  });

  it('modifie directement les notifications quotidiennes', async () => {
    currentUser.mockReturnValue({ user: { name: 'Alice', email: 'alice@example.com', dailyReminderEnabled: true }, isLoading: false, isError: false });
    updatePreferences.mockResolvedValue({ dailyReminderEnabled: false });
    render(<ProfileContent />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Activer les notifications quotidiennes' }));
    await waitFor(() => expect(updatePreferences).toHaveBeenCalledWith({ dailyReminderEnabled: false }));
  });
});
