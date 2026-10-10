import type { QueryClient } from "@tanstack/react-query";

const userScopedStorageKeys = [
  "vasco:dashboard-layouts",
  "vasco:onboarding-complete",
] as const;

export async function clearAuthenticatedClientState(queryClient: QueryClient) {
  const cancellation = queryClient.cancelQueries();
  queryClient.clear();
  await cancellation;
  if (typeof window === "undefined") return;
  userScopedStorageKeys.forEach((key) => window.localStorage.removeItem(key));
}
