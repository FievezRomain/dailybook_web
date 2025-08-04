import { useState, useEffect } from "react";
import type { Event } from "@/types/event";

export function useEventForm(initial: Partial<Event> = {}) {
    const [values, setValues] = useState<Partial<Event>>(initial);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset le formulaire quand initial change (ex: ouverture drawer)
    useEffect(() => {
        setValues((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(initial)) return prev;
            return initial;
        });
        setErrors((prev) => {
            if (Object.keys(prev).length === 0) return prev; 
            return {};
        });
    }, [initial]);

    // Fonctions pour gérer les changements de champs
    // et la validation des données
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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