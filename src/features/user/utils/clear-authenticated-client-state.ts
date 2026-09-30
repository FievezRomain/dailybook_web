import type { QueryClient } from "@tanstack/react-query";

const userScopedStorageKeys = [
  "vasco:dashboard-layouts",
  "vasco:onboarding-complete",
] as const;

export async function clearAuthenticatedClientState(queryClient: QueryClient) {
  await queryClient.cancelQueries();
  queryClient.clear();
  if (typeof window === "undefined") return;
  userScopedStorageKeys.forEach((key) => window.localStorage.removeItem(key));
}
