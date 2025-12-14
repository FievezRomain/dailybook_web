'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { useAnimalsData } from "@/hooks/useAnimalsData";
import { Animal, AnimalBodyPicture } from "@/types/animal";
import { useUserContext } from "./UserContext";
import { enrichAnimals } from "@/utils/animalsUtils";
import * as animalService from "@/services/animals";
import * as Sentry from "@sentry/react";
import { ImageSigned } from "@/types/image";
import { getPresignedGetUrl } from "@/services/storage";

type AnimalContextType = {
  animals: Animal[] | undefined;
  isLoading: boolean;
  isError: any;
  addAnimal: (animal: Partial<Animal>) => Promise<void>;
  updateAnimal: (id: number, animal: Partial<Animal>) => Promise<void>;
  deleteAnimal: (id: number) => Promise<void>;
  updateAnimalImage: (id: number, imageObj: ImageSigned) => void;
  updateBodyPictureImage: (animalId: number, bodyPictureId: number, imageObj: ImageSigned) => void;
  getBodyPicturesAnimal: (id: number) => Promise<AnimalBodyPicture[]>;
  addBodyPicturesAnimal: (id: number, filename: string) => Promise<void>;
  deleteBodyPicturesAnimal: (id: number) => Promise<void>;
  refresh: () => void;
};

const AnimalContext = createContext<AnimalContextType | undefined>(undefined);

export function AnimalProvider({ children }: { children: React.ReactNode }) {
  const { animals: data, isError: error, isLoading, mutate } = useAnimalsData();
  const { user, isLoading: isUserLoading } = useUserContext();
  const [animals, setAnimals] = useState<Animal[] | undefined>(undefined);

  useEffect(() => {
    if (data && user && !isLoading && !isUserLoading) {
      enrichAnimals(data, user.uid).then(setAnimals);
    } else {
      setAnimals(undefined);
    }
  }, [data, user, isLoading, isUserLoading]);

  const updateAnimalImage = (id: number, imageObj: ImageSigned) => {
    setAnimals(prev =>
      prev?.map(a => (a.id === id ? { ...a, imageSigned: imageObj } : a))
    );
  };

  const updateBodyPictureImage = (animalId: number, bodyPictureId: number, imageObj: ImageSigned) => {
    setAnimals(prev =>
      prev?.map(a =>
        a.id === animalId
          ? {
              ...a,
              bodyPictures: a.bodyPictures?.map(bp =>
                bp.id === bodyPictureId ? { ...bp, imageSigned: imageObj } : bp
              ),
            }
          : a
      )
    );
  };

  const getBodyPicturesAnimal = async (id: number): Promise<AnimalBodyPicture[]> => {
    try {
      const bodyPictures = await animalService.getBodyPicturesAnimal(id);
      return await Promise.all(
        bodyPictures.map(async (pic): Promise<AnimalBodyPicture> => {
        const imageSigned = await getPresignedGetUrl(pic.filename, "body", id);
        return {
          id: pic.id,
          filename: pic.filename,
          imageSigned: {url: imageSigned, expiresAt: Date.now() + 4.5 * 60 * 1000},
          date_enregistrement: pic.date_enregistrement,
          id_animal: pic.id_animal,
        };
      })
      );
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la récupération des images de l'évolution du physique de l'animal");
    }
  };

  const deleteBodyPicturesAnimal = async (id: number) => {
    try {
      await animalService.deleteBodyPicturesAnimal(id);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la suppression de l'image de l'évolution du physique de l'animal");
    }
  };

  const addBodyPicturesAnimal = async (id: number, filename: string) => {
    try {
      await animalService.addBodyPicturesAnimal(id, filename);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de l'ajout de l'image de l'évolution du physique de l'animal");
    }
  };

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
        updateAnimalImage,
        updateBodyPictureImage,
        getBodyPicturesAnimal,
        addBodyPicturesAnimal,
        deleteBodyPicturesAnimal,
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