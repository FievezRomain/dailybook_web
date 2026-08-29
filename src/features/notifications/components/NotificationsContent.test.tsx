import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationsContent from './NotificationsContent';

const mocks = vi.hoisted(() => ({
  currentUser: vi.fn(),
  notifications: vi.fn(),
  actions: vi.fn(),
  preferences: vi.fn(),
  respond: vi.fn(),
  setRead: vi.fn(),
  remove: vi.fn(),
  markAll: vi.fn(),
  updatePreferences: vi.fn(),
}));

vi.mock('@/features/user/hooks/use-current-user', () => ({ useCurrentUser: mocks.currentUser }));
vi.mock('../hooks/use-notifications', () => ({
  useNotificationsQuery: mocks.notifications,
  useNotificationGroupActions: mocks.actions,
  useNotificationPreferencesMutation: mocks.preferences,
}));

const invitation = {
  id: 4,
  type: 'group_member' as const,
  title: 'Invitation dans un groupe',
  message: 'Souhaitez-vous rejoindre Écurie Vasco ?',
  object_id: 9,
  is_read: false,
  created_at: '2026-08-25T08:00:00+02:00',
  action_available: true,
  proposed_by: 'maya@example.com (Maya)',
};

describe('NotificationsContent', () => {
  beforeEach(() => {
    mocks.respond.mockReset().mockResolvedValue({});
    mocks.setRead.mockReset().mockResolvedValue(undefined);
    mocks.remove.mockReset().mockResolvedValue(undefined);
    mocks.markAll.mockReset().mockResolvedValue(undefined);
    mocks.updatePreferences.mockReset().mockResolvedValue({ dailyReminderEnabled: false });
    mocks.currentUser.mockReturnValue({ user: { dailyReminderEnabled: true }, isLoading: false });
    mocks.notifications.mockReturnValue({ notifications: [invitation], unreadCount: 1, isLoading: false, isError: false, isMutating: false, markAllRead: mocks.markAll, setRead: mocks.setRead, deleteNotification: mocks.remove, refetch: vi.fn() });
    mocks.actions.mockReturnValue({ respond: mocks.respond, isPending: false });
    mocks.preferences.mockReturnValue({ updatePreferences: mocks.updatePreferences, isPending: false });
  });

  it('traite une invitation depuis la liste puis la marque comme lue', async () => {
    render(<NotificationsContent />);
    expect(screen.getByText('Non lue')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Accepter' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Accepter' }));
    await waitFor(() => expect(mocks.respond).toHaveBeenCalledWith({ type: 'group_member', objectId: 9, status: 'accepted' }));
    expect(mocks.setRead).toHaveBeenCalledWith(4, true);
  });

  it('confirme la suppression et permet de modifier le rappel quotidien', async () => {
    render(<NotificationsContent />);
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Supprimer' }));
    await waitFor(() => expect(mocks.remove).toHaveBeenCalledWith(4));

    fireEvent.click(screen.getByRole('checkbox'));
    await waitFor(() => expect(mocks.updatePreferences).toHaveBeenCalledWith({ dailyReminderEnabled: false }));
  });

  it('marque toutes les notifications comme lues', async () => {
    render(<NotificationsContent />);
    fireEvent.click(screen.getByRole('button', { name: /Tout marquer/ }));
    await waitFor(() => expect(mocks.markAll).toHaveBeenCalled());
  });
});
