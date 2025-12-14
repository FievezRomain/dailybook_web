import useSWR from "swr";
import * as animalService from "@/services/animals";
import { Animal } from "@/types/animal";

export function useAnimalsData() {
  const { data, error, isLoading, mutate } = useSWR<Animal[]>("/api/animals", animalService.getAnimals);

  return {
    animals: data,
    isLoading,
    isError: error,
    mutate,
  };
}