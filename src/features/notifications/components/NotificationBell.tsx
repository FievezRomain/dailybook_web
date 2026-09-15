'use client';

import Link from 'next/link';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { useNotificationsQuery } from '../hooks/use-notifications';

export function NotificationBell() {
  const { unreadCount, notifications, isError, setRead, isMutating } = useNotificationsQuery();
  const label = isError ? 'Notifications indisponibles' : unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Notifications';
  const recent = notifications?.slice(0, 3) ?? [];

  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="relative" aria-label={label}>
        <Bell className="size-5" fill={unreadCount > 0 ? 'currentColor' : 'none'} aria-hidden="true" />
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-destructive px-1 text-center text-xs font-semibold leading-5 text-destructive-foreground" aria-hidden="true">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" size="comfortable" aria-label="Menu des notifications">
      <DropdownMenuLabel>{isError ? 'Notifications indisponibles' : unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Notifications'}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {isError ? <DropdownMenuItem asChild><Link href="/notifications">Réessayer depuis la page Notifications</Link></DropdownMenuItem> : recent.length > 0 ? recent.map((notification) => <DropdownMenuItem key={notification.id} disabled={isMutating} onSelect={() => { if (!notification.is_read) void setRead(notification.id, true); }} asChild><Link href="/notifications"><span className="flex min-w-0 flex-col gap-0.5"><span className="truncate font-medium">{notification.title}</span><span className="truncate text-muted-foreground">{notification.is_read ? 'Lue' : 'Non lue'} · {notification.message}</span></span></Link></DropdownMenuItem>) : <DropdownMenuItem disabled><BellOff className="size-4" /> Aucune notification</DropdownMenuItem>}
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild><Link href="/notifications">Voir toutes les notifications</Link></DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
