'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useNotificationsQuery } from '../hooks/use-notifications';

export function NotificationBell() {
  const { unreadCount, isError } = useNotificationsQuery();
  const label = isError
    ? 'Notifications indisponibles'
    : unreadCount > 0
      ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
      : 'Notifications';

  return (
    <Button asChild variant="ghost" size="icon" className="relative" aria-label={label}>
      <Link href="/notifications">
        <Bell className="size-5" fill={unreadCount > 0 ? 'currentColor' : 'none'} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-destructive px-1 text-center text-xs font-semibold leading-5 text-destructive-foreground" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
