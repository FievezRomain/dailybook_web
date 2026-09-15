'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCurrentUser } from '../api/user-api';
import { currentUserQueryKey } from './use-current-user';
import type { UserWithPicture } from '../types/user';

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (user) => queryClient.setQueryData<UserWithPicture>(currentUserQueryKey, (current) => ({ ...user, pictureUrl: current?.pictureUrl })),
  });
  return { updateProfile: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}
