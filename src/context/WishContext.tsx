'use client';

import { createContext, useContext } from "react";
import { useWishsData } from "@/hooks/useWishsData";
import * as wishService from "@/services/wishs";
import * as Sentry from "@sentry/react";
import { Wish } from "@/types/wish";

type WishContextType = {
  wishs: Wish[] | undefined;
  isLoading: boolean;
  isError: any;
  addWish: (wish: Partial<Wish>) => Promise<void>;
  updateWish: (id: number, wish: Partial<Wish>) => Promise<void>;
  deleteWish: (id: number) => Promise<void>;
  refresh: () => void;
};

const WishContext = createContext<WishContextType | undefined>(undefined);

export function WishProvider({ children }: { children: React.ReactNode }) {
  const { wishs, isLoading, isError, mutate } = useWishsData();

  const addWish = async (wish: Partial<Wish>) => {
    try {
      await wishService.addWish(wish);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la création du souhait");
    }
  };

  const updateWish = async (id: number, wish: Partial<Wish>) => {
    try {
      await wishService.updateWish(id, wish);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la modification du souhait");
    }
  };

  const deleteWish = async (id: number) => {
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
        wishs,
        isLoading,
        isError,
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

export function useWishs() {
  const ctx = useContext(WishContext);
  if (!ctx) throw new Error("useWishs must be used within WishProvider");
  return ctx;
}