"use client";

import { useState } from "react";
import type { Animal } from "@/features/animals/types/animal";

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
    if (!vals.nom) errs.nom = "Le nom est requis";
    if (!vals.espece) errs.espece = "L'espèce est requise";
    if (!vals.datenaissance) errs.datenaissance = "La date de naissance est requise";
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
