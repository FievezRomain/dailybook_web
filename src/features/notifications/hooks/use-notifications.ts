'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { currentUserQueryKey } from '@/features/user/hooks/use-current-user';
import type { CurrentUser } from '@/features/user/types/user';
import { respondAnimalShare, respondInvitation } from '@/features/groups/api/groups-api';
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  setNotificationRead,
  updateNotificationPreferences,
} from '../api/notifications-api';
import type {
  NotificationsResponse,
  SetNotificationReadInput,
  UpdateNotificationPreferencesInput,
} from '../types/notification';

export const notificationsQueryKey = ['notifications'] as const;

function withUnreadCount(data: NotificationsResponse): NotificationsResponse {
  return {
    notifications: data.notifications,
    unreadCount: data.notifications.filter((notification) => !notification.is_read).length,
  };
}

export function useNotificationsQuery() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: getNotifications,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.setQueryData<NotificationsResponse>(notificationsQueryKey, (current) =>
      current ? { notifications: current.notifications.map((item) => ({ ...item, is_read: true })), unreadCount: 0 } : current),
  });
  const setRead = useMutation({
    mutationFn: ({ id, input }: { id: number; input: SetNotificationReadInput }) => setNotificationRead(id, input),
    onSuccess: (_result, variables) => queryClient.setQueryData<NotificationsResponse>(notificationsQueryKey, (current) =>
      current ? withUnreadCount({
        ...current,
        notifications: current.notifications.map((item) =>
          item.id === variables.id ? { ...item, is_read: variables.input.is_read } : item),
      }) : current),
  });
  const remove = useMutation({
    mutationFn: deleteNotification,
    onSuccess: (_result, id) => queryClient.setQueryData<NotificationsResponse>(notificationsQueryKey, (current) =>
      current ? withUnreadCount({
        ...current,
        notifications: current.notifications.filter((item) => item.id !== id),
      }) : current),
  });

  return {
    notifications: query.data?.notifications,
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    markAllRead: markAllRead.mutateAsync,
    setRead: (id: number, isRead: boolean) => setRead.mutateAsync({ id, input: { is_read: isRead } }),
    deleteNotification: remove.mutateAsync,
    refetch: query.refetch,
    isMutating: markAllRead.isPending || setRead.isPending || remove.isPending,
  };
}

export function useNotificationGroupActions() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ type, objectId, status }: {
      type: 'group_member' | 'group_animal';
      objectId: number;
      status: 'accepted' | 'declined';
    }) => type === 'group_member'
      ? respondInvitation(objectId, { status })
      : respondAnimalShare(objectId, { status }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['groups'] }),
        queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
      ]);
    },
  });

  return {
    respond: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

export function useNotificationPreferencesMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: (preferences) => queryClient.setQueryData<CurrentUser>(currentUserQueryKey, (current) =>
      current ? { ...current, dailyReminderEnabled: preferences.dailyReminderEnabled } : current),
  });

  return {
    updatePreferences: (input: UpdateNotificationPreferencesInput) => mutation.mutateAsync(input),
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
