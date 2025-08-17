'use client';

import { createContext, useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { Animal } from "@/types/animal";
import { useUserContext } from "./UserContext";
import { enrichAnimals } from "@/utils/animalsUtils";
import * as animalService from "@/services/animals";
import * as Sentry from "@sentry/react";

type AnimalContextType = {
  animals: Animal[] | undefined;
  isLoading: boolean;
  isError: any;
  addAnimal: (animal: Partial<Animal>) => Promise<void>;
  updateAnimal: (id: number, animal: Partial<Animal>) => Promise<void>;
  deleteAnimal: (id: number) => Promise<void>;
  refresh: () => void;
};

const AnimalContext = createContext<AnimalContextType | undefined>(undefined);

const fetcher = async () => {
  const data = await animalService.getAnimals();
  return data;
};

export function AnimalProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR("/api/animals", fetcher);

  const { user, isLoading: isUserLoading } = useUserContext();

  const [animals, setAnimals] = useState<Animal[] | undefined>(undefined);

  useEffect(() => {
    if (data && user && !isLoading && !isUserLoading) {
      enrichAnimals(data, user.uid).then(setAnimals);
    } else {
      setAnimals(undefined);
    }
  }, [data, user, isLoading, isUserLoading]);

  const addAnimal = async (animal: Partial<Animal>) => {
    try {
      await animalService.createAnimal(animal);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la création de l'animal");
    }
  };

  const updateAnimal = async (id: number, animal: Partial<Animal>) => {
    try {
      await animalService.updateAnimal(id, animal);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la modification de l'animal");
    }
  };

  const deleteAnimal = async (id: number) => {
    try {
      await animalService.deleteAnimal(id);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la suppression de l'animal");
    }
  };

  const refresh = () => mutate();

  return (
    <AnimalContext.Provider
      value={{
        animals,
        isLoading: isLoading || isUserLoading,
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