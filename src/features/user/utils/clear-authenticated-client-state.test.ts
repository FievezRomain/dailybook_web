import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const clearAnimalSignedUrlCache = vi.hoisted(() => vi.fn());

vi.mock("@/features/animals/utils/animals", () => ({
  clearAnimalSignedUrlCache,
}));

import { clearAuthenticatedClientState } from "./clear-authenticated-client-state";

describe("clearAuthenticatedClientState", () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearAnimalSignedUrlCache.mockClear();
  });

  it("efface les données du compte sans supprimer les préférences générales", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["animals"], [{ id: 12, nom: "Vasco" }]);
    window.localStorage.setItem("vasco:dashboard-layouts", "ancien-compte");
    window.localStorage.setItem("vasco:onboarding-complete", "true");
    window.localStorage.setItem("vasco:rail-expanded", "false");

    await clearAuthenticatedClientState(queryClient);

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(clearAnimalSignedUrlCache).toHaveBeenCalledOnce();
    expect(window.localStorage.getItem("vasco:dashboard-layouts")).toBeNull();
    expect(window.localStorage.getItem("vasco:onboarding-complete")).toBeNull();
    expect(window.localStorage.getItem("vasco:rail-expanded")).toBe("false");
  });
});
