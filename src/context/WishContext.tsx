'use client';

import { createContext, useContext } from "react";
import useSWR from "swr";
import { Wish } from "@/types/wish";
import * as wishService from "@/services/wishs";
import * as Sentry from "@sentry/react";

type WishContextType = {
  wishes: Wish[] | undefined;
  isLoading: boolean;
  isError: any;
  addWish: (wish: Partial<Wish>) => Promise<void>;
  updateWish: (id: string, wish: Partial<Wish>) => Promise<void>;
  deleteWish: (id: string) => Promise<void>;
  refresh: () => void;
};

const WishContext = createContext<WishContextType | undefined>(undefined);

const fetcher = async () => {
  return await wishService.getWishs();
};

export function WishProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR("/api/wishes", fetcher);

  const wishes: Wish[] | undefined = data;

  const addWish = async (wish: Partial<Wish>) => {
    try {
      await wishService.addWish(wish as any);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la création du souhait");
    }
  };

  const updateWish = async (id: string, wish: Partial<Wish>) => {
    try {
      await wishService.updateWish(id, wish);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la modification du souhait");
    }
  };

  const deleteWish = async (id: string) => {
    try {
      await wishService.deleteWish(id);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la suppression du souhait");
    }
  };

  const refresh = () => mutate();

  return (
    <WishContext.Provider
      value={{
        wishes,
        isLoading,
        isError: error,
        addWish,
        updateWish,
        deleteWish,
        refresh,
      }}
    >
      {children}
    </WishContext.Provider>
  );
}

export function useWishes() {
  const ctx = useContext(WishContext);
  if (!ctx) throw new Error("useWishes must be used within WishProvider");
  return ctx;
}