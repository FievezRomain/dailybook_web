'use client';

import { createContext, useContext } from "react";
import useSWR from "swr";
import { Animal } from "@/types/animal";

type AnimalContextType = {
  animals: Animal[] | undefined;
  isLoading: boolean;
  isError: any;
  addAnimal: (animal: Partial<Animal>) => Promise<void>;
  updateAnimal: (id: string, animal: Partial<Animal>) => Promise<void>;
  deleteAnimal: (id: string) => Promise<void>;
  refresh: () => void;
};

const AnimalContext = createContext<AnimalContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function AnimalProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR("/api/animals", fetcher);

  const animals: Animal[] | undefined = data;

  const addAnimal = async (animal: Partial<Animal>) => {
    await fetch("/api/animals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(animal),
    });
    await mutate();
  };

  const updateAnimal = async (id: string, animal: Partial<Animal>) => {
    await fetch(`/api/animals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(animal),
    });
    await mutate();
  };

  const deleteAnimal = async (id: string) => {
    await fetch(`/api/animals/${id}`, { method: "DELETE" });
    await mutate();
  };

  const refresh = () => mutate();

  return (
    <AnimalContext.Provider
      value={{
        animals,
        isLoading,
        isError: error,
        addAnimal,
        updateAnimal,
        deleteAnimal,
        refresh,
      }}
    >
      {children}
    </AnimalContext.Provider>
  );
}

export function useAnimals() {
  const ctx = useContext(AnimalContext);
  if (!ctx) throw new Error("useAnimals must be used within AnimalProvider");
  return ctx;
}