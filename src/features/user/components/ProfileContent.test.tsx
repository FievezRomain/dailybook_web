import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const currentUser = vi.hoisted(() => vi.fn());
const updateProfile = vi.hoisted(() => vi.fn());
const updatePreferences = vi.hoisted(() => vi.fn());
const routerReplace = vi.hoisted(() => vi.fn());
const routerRefresh = vi.hoisted(() => vi.fn());
const accountActions = vi.hoisted(() => ({
  changePassword: vi.fn(),
  deleteAccount: vi.fn(),
  logout: vi.fn(),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: routerReplace, refresh: routerRefresh }) }));
vi.mock('@/features/user/hooks/use-current-user', () => ({ useCurrentUser: currentUser }));
vi.mock('@/features/user/hooks/use-update-current-user', () => ({ useUpdateCurrentUser: () => ({ updateProfile, isPending: false, error: null }) }));
vi.mock('@/features/notifications/hooks/use-notifications', () => ({ useNotificationPreferencesMutation: () => ({ updatePreferences, isPending: false }) }));
vi.mock('@/features/user/api/account-actions', () => ({
  changeCurrentUserPassword: accountActions.changePassword,
  deleteCurrentAccount: accountActions.deleteAccount,
}));
vi.mock('@/features/user/hooks/use-logout-current-user', () => ({
  useLogoutCurrentUser: () => accountActions.logout,
}));
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
    expect(screen.getByText('Version gratuite')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Passer à la version Premium' })).toHaveAttribute('href', 'https://www.vascoandco.fr/produit/vasco-premium/');
    expect(screen.getByRole('link', { name: 'Passer à la version Premium' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'Passer à la version Premium' })).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByRole('button', { name: /Changer le mot de passe/ })).toBeVisible();
    expect(screen.getByRole('link', { name: /Contacter le support/ })).toHaveAttribute('href', expect.stringContaining('mailto:contact@vascoandco.com'));
    expect(screen.getByRole('button', { name: /Supprimer mon compte/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /Se déconnecter/ })).toBeVisible();
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
    expect(screen.getByText('Activez ou désactivez la notification quotidienne prévue pour vous demander si vous avez quelque chose à tracer.')).toBeVisible();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Activer les notifications quotidiennes' }));
    await waitFor(() => expect(updatePreferences).toHaveBeenCalledWith({ dailyReminderEnabled: false }));
  });

  it('reprend le parcours mobile de changement de mot de passe', async () => {
    currentUser.mockReturnValue({ user: { name: 'Alice', email: 'alice@example.com', subscription: 'Premium', dailyReminderEnabled: false }, isLoading: false, isError: false });
    accountActions.changePassword.mockResolvedValue(undefined);
    render(<ProfileContent />);

    expect(screen.getByText('Version Premium')).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Passer à la version Premium' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Changer le mot de passe/ }));
    fireEvent.change(screen.getByLabelText('Mot de passe actuel'), { target: { value: 'ancien-secret' } });
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'NouveauSecret1!' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'NouveauSecret1!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Mettre à jour' }));

    await waitFor(() => expect(accountActions.changePassword).toHaveBeenCalledWith('ancien-secret', 'NouveauSecret1!'));
  });

  it('confirme la déconnexion avant de revenir à la connexion', async () => {
    currentUser.mockReturnValue({ user: { name: 'Alice', email: 'alice@example.com', subscription: 'Free', dailyReminderEnabled: false }, isLoading: false, isError: false });
    accountActions.logout.mockResolvedValue(undefined);
    render(<ProfileContent />);

    fireEvent.click(screen.getByRole('button', { name: /Se déconnecter/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Se déconnecter' }));

    await waitFor(() => expect(accountActions.logout).toHaveBeenCalledOnce());
    expect(routerReplace).toHaveBeenCalledWith('/login');
    expect(routerRefresh).toHaveBeenCalledOnce();
  });
});
