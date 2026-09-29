'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../api/user-api';
import { getUserPictureUrl } from '../api/user-picture';
import type { UserWithPicture } from '../types/user';

export const currentUserQueryKey = ['current-user'] as const;

export function useCurrentUser() {
  const query = useQuery<UserWithPicture>({
    queryKey: currentUserQueryKey,
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user.picture) return user;
      try {
        return { ...user, pictureUrl: await getUserPictureUrl(user.picture) };
      } catch {
        return user;
      }
    },
    staleTime: 60_000,
  });

  return {
    user: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    isPremium: query.data?.subscription === 'Premium',
    refetch: query.refetch,
  };
}
