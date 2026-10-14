"use client";

import { useState } from "react";
import {
  ANIMAL_FOOD_MAX_LENGTH,
  ANIMAL_SHORT_TEXT_MAX_LENGTH,
} from "@/features/animals/schemas/animal";
import type { Animal } from "@/features/animals/types/animal";

const animalTextLimits: Partial<Record<keyof Animal, number>> = {
  nom: ANIMAL_SHORT_TEXT_MAX_LENGTH,
  espece: ANIMAL_SHORT_TEXT_MAX_LENGTH,
  race: ANIMAL_SHORT_TEXT_MAX_LENGTH,
  sexe: ANIMAL_SHORT_TEXT_MAX_LENGTH,
  couleur: ANIMAL_SHORT_TEXT_MAX_LENGTH,
  nompere: ANIMAL_SHORT_TEXT_MAX_LENGTH,
  nommere: ANIMAL_SHORT_TEXT_MAX_LENGTH,
  food: ANIMAL_FOOD_MAX_LENGTH,
};

export function useAnimalForm(initial: Partial<Animal> = {}) {
  const [values, setValues] = useState<Partial<Animal>>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  };

  const validate = (vals: Partial<Animal>) => {
    const errs: Record<string, string> = {};
    if (!vals.nom?.trim()) errs.nom = "Le nom est requis";
    if (!vals.espece) errs.espece = "L'espèce est requise";
    Object.entries(animalTextLimits).forEach(([field, maxLength]) => {
      const value = vals[field as keyof Animal];
      if (typeof value === "string" && value.trim().length > maxLength) {
        errs[field] = `Ce champ ne peut pas dépasser ${maxLength} caractères`;
      }
    });
    return errs;
  };

  const handleSubmit = (cb: (data: Partial<Animal>) => void) => (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length === 0) cb(values);
  };

  const resetForm = () => {
    setValues(initial);
    setErrors({});
  };

  return {
    values,
    errors,
    handleChange,
    handleTextareaChange,
    handleSubmit,
    resetForm,
    setValues,
  };
}
