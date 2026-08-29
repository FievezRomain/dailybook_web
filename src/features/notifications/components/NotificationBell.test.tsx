import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NotificationBell } from './NotificationBell';

const notifications = vi.hoisted(() => vi.fn());
vi.mock('../hooks/use-notifications', () => ({ useNotificationsQuery: notifications }));

describe('NotificationBell', () => {
  it('annonce le compteur non lu avec un libellé accessible', () => {
    notifications.mockReturnValue({ unreadCount: 3, isError: false });
    render(<NotificationBell />);
    expect(screen.getByRole('link', { name: '3 notifications non lues' })).toHaveAttribute('href', '/notifications');
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('annonce une indisponibilité sans afficher de faux compteur', () => {
    notifications.mockReturnValue({ unreadCount: 0, isError: true });
    render(<NotificationBell />);
    expect(screen.getByRole('link', { name: 'Notifications indisponibles' })).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
