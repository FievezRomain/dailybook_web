'use client';

import { createContext, useContext } from "react";
import useSWR from "swr";
import { Wish } from "@/types/wish";

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

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function WishProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR("/api/wishes", fetcher);

  const wishes: Wish[] | undefined = data;

  const addWish = async (wish: Partial<Wish>) => {
    await fetch("/api/wishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wish),
    });
    await mutate();
  };

  const updateWish = async (id: string, wish: Partial<Wish>) => {
    await fetch(`/api/wishes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wish),
    });
    await mutate();
  };

  const deleteWish = async (id: string) => {
    await fetch(`/api/wishes/${id}`, { method: "DELETE" });
    await mutate();
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