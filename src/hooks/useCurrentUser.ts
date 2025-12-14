'use client';

import { User } from '@/types/user';
import * as userService from "@/services/user";
import useSWR from 'swr';

export function useCurrentUser() {
  const { data, error, isLoading } = useSWR<User>('/api/me', userService.getUser);

  return {
    user: data,
    isLoading,
    isError: error,
    isPremium: data?.isPremium || false,
  };
}