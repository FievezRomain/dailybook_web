import { useState, useEffect } from "react";
import { Objective } from "@/types/objective";

export function useObjectiveForm(initial: Partial<Objective> = {}) {
    const [values, setValues] = useState<Partial<Objective>>(initial);
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
    const validate = (vals: Partial<Objective>) => {
        const errs: Record<string, string> = {};
        if (!vals.title) errs.title = "Le titre est requis";
        if (!vals.datedebut) errs.datedebut = "La date de début est requise";
        if (!vals.datefin) errs.datefin = "La date de fin est requise";
        if (!vals.sousetapes || vals.sousetapes.length === 0) {
            errs.sousetapes = "Ajoutez au moins une étape";
        }
        if (!vals.animaux || vals.animaux.length === 0) {
            errs.animaux = "Sélectionnez au moins un animal";
        }
        return errs;
    };

    // Fonction de soumission du formulaire
    // qui prend une callback pour traiter les données
    const handleSubmit = (cb: (data: Partial<Objective>) => void) => (e: React.FormEvent) => {
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

    // Fonctions spécifiques pour gérer les sous-étapes
    // (ajout, suppression, modification)
    const handleAddEtape = () => setValues((prev) => ({
        ...prev,
        sousetapes: [
            ...(prev.sousetapes || []),
            {
                id: undefined, // ou un autre identifiant unique
                etape: "",
                state: false, // ou la valeur par défaut
                order: (prev.sousetapes?.length || 0) + 1,
            }
        ],
    }));
    const handleRemoveEtape = (idx: number) => setValues((prev) => ({
        ...prev,
        sousetapes: (prev.sousetapes || []).filter((_, i) => i !== idx),
    }));
    const handleEtapeChange = (idx: number, value: string) =>
        setValues((prev) => ({
            ...prev,
            sousetapes: (prev.sousetapes || []).map((etape, i) => (i === idx ? { ...etape, etape: value } : etape)),
        }));

    return {
        values,
        errors,
        handleChange,
        handleTextareaChange,
        handleAddEtape,
        handleRemoveEtape,
        handleEtapeChange,
        handleSubmit,
        resetForm,
        setValues,
    };
}