"use client";

import { useState } from "react";
import type { Event } from "@/features/events/types/event";

export function useEventForm(initial: Partial<Event> = {}) {
    const [values, setValues] = useState<Partial<Event>>(initial);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fonctions pour gérer les changements de champs
    // et la validation des données
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    };

    // Fonction pour gérer les changements de textarea
    // et mettre à jour les valeurs du formulaire
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    };

    // Fonction de validation des données du formulaire
    // qui retourne un objet d'erreurs si des champs sont invalides
    const validate = (vals: Partial<Event>) => {
        const errs: Record<string, string> = {};
        if (!vals.nom) errs.nom = "Le nom est requis";
        if (!vals.eventtype) errs.eventtype = "Le type est requis";
        if (!vals.dateevent) errs.dateevent = "La date est requise";
        if (vals.eventtype === "depense" && !vals.categoriedepense) {
            errs.categoriedepense = "La catégorie de dépense est requise";
        }
        if (!vals.animaux || vals.animaux.length === 0) {
            errs.animaux = "Sélectionnez au moins un animal";
        }
        if (vals.frequencevalue && (vals.eventtype === 'soins' || vals.eventtype === 'balade')) {
            const endDate = vals.eventtype === 'soins' ? vals.datefinsoins : vals.datefinbalade;
            if (!endDate) errs.frequencevalue = 'La date de fin est requise pour répéter cet événement';
            else if (vals.dateevent && endDate < vals.dateevent) errs.frequencevalue = 'La date de fin doit suivre la date de début';
        }
        return errs;
    };

    // Fonction de soumission du formulaire
    // qui prend une callback pour traiter les données
    const handleSubmit = (cb: (data: Partial<Event>) => void) => (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate(values);
        setErrors(errs);
        if (Object.keys(errs).length === 0) cb(values);
    };

    // Fonction pour réinitialiser le formulaire
    // à ses valeurs initiales et vider les erreurs
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
