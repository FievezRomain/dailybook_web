"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { logoutCurrentUser } from "@/features/user/api/account-actions";
import { clearAuthenticatedClientState } from "@/features/user/utils/clear-authenticated-client-state";

export function useLogoutCurrentUser() {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    try {
      await logoutCurrentUser();
    } finally {
      await clearAuthenticatedClientState(queryClient);
    }
  }, [queryClient]);
}
