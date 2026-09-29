import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NotificationBell } from './NotificationBell';

const notifications = vi.hoisted(() => vi.fn());
vi.mock('../hooks/use-notifications', () => ({ useNotificationsQuery: notifications }));

describe('NotificationBell', () => {
  it('annonce le compteur non lu avec un libellé accessible', () => {
    notifications.mockReturnValue({ unreadCount: 3, isError: false, isMutating: false, setRead: vi.fn(), notifications: [{ id: 1, title: 'Invitation', message: 'Rejoindre le groupe', is_read: false }] });
    render(<NotificationBell />);
    expect(screen.getByRole('button', { name: '3 notifications non lues' })).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('annonce une indisponibilité sans afficher de faux compteur', () => {
    notifications.mockReturnValue({ unreadCount: 0, isError: true, isMutating: false, setRead: vi.fn(), notifications: [] });
    render(<NotificationBell />);
    expect(screen.getByRole('button', { name: 'Notifications indisponibles' })).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
