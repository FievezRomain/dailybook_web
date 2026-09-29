import { ListChecks, PawPrint, Plus, Target, Trash2 } from "lucide-react";

import { AnimalSelector } from "@/features/animals/components/AnimalSelector";
import type { Animal } from "@/features/animals/types/animal";
import {
  useObjectiveForm,
  type ObjectiveFormValue,
} from "@/features/objectives/hooks/use-objective-form";
import type { Objective } from "@/features/objectives/types/objective";
import {
  FormSection,
  SteppedFormSheet,
} from "@/shared/components/forms/SteppedFormSheet";
import { Button } from "@/shared/components/ui/button";
import { DateInput } from "@/shared/components/ui/form-feedback";
import { Input } from "@/shared/components/ui/input";
import type { ImageSigned } from "@/types/image";

type ObjectiveFormDrawerProps = {
  open: boolean;
  animals: Animal[] | undefined;
  onClose: () => void;
  onSubmit: (data: ObjectiveFormValue) => Promise<void>;
  isSubmitting?: boolean;
  initialObjective?: Partial<Objective>;
  isDuplicate?: boolean;
  onUpdateAnimalImage: (id: number, imageObj: ImageSigned) => void;
};

export const ObjectiveFormDrawer = ({
  open,
  animals,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialObjective,
  isDuplicate = false,
  onUpdateAnimalImage,
}: ObjectiveFormDrawerProps) => {
  const {
    values,
    errors,
    handleChange,
    handleAddEtape,
    handleRemoveEtape,
    handleEtapeChange,
    handleSubmit,
    setValues,
  } = useObjectiveForm(initialObjective);
  const isEdit = Boolean(initialObjective?.id);
  const title = isDuplicate
    ? "Dupliquer l’objectif"
    : isEdit
      ? "Modifier l’objectif"
      : "Créer un objectif";

  return (
    <SteppedFormSheet
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      title={title}
      description="Définissez une intention claire, associez les animaux concernés puis transformez-la en étapes réalisables."
      submitLabel={
        isDuplicate
          ? "Dupliquer l’objectif"
          : isEdit
            ? "Enregistrer les modifications"
            : "Créer l’objectif"
      }
      submitting={isSubmitting}
      steps={[
        {
          title: "Objectif",
          description: "Donnez un cap et une période à votre objectif.",
          icon: Target,
          content: (
            <div className="space-y-4">
              <FormSection
                title="Définition"
                description="Le titre doit être immédiatement compréhensible."
              >
                <div className="grid gap-4">
                  <label className="grid gap-1.5" htmlFor="objective-title">
                    <span className="text-sm font-medium">
                      Titre <span aria-hidden="true">*</span>
                    </span>
                    <Input
                      id="objective-title"
                      value={values.title || ""}
                      name="title"
                      onChange={handleChange}
                      required
                      aria-invalid={Boolean(errors.title)}
                      aria-describedby={
                        errors.title ? "objective-title-error" : undefined
                      }
                      placeholder="Ex. Reprendre les sorties progressivement"
                    />
                    {errors.title && (
                      <span
                        id="objective-title-error"
                        className="text-xs text-destructive"
                      >
                        {errors.title}
                      </span>
                    )}
                  </label>
                </div>
              </FormSection>
              <FormSection
                title="Période"
                description="Les dates permettent de mesurer la progression dans le temps."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5" htmlFor="objective-start">
                    <span className="text-sm font-medium">Date de début</span>
                    <DateInput
                      name="datedebut"
                      value={values.datedebut?.slice(0, 10) || ""}
                      onChange={handleChange}
                      id="objective-start"
                    />
                  </label>
                  <label className="grid gap-1.5" htmlFor="objective-end">
                    <span className="text-sm font-medium">Date de fin</span>
                    <DateInput
                      name="datefin"
                      value={values.datefin?.slice(0, 10) || ""}
                      onChange={handleChange}
                      id="objective-end"
                      aria-invalid={Boolean(errors.datefin)}
                      aria-describedby={
                        errors.datefin ? "objective-date-error" : undefined
                      }
                    />
                    {errors.datefin && (
                      <span
                        id="objective-date-error"
                        className="text-xs text-destructive"
                      >
                        {errors.datefin}
                      </span>
                    )}
                  </label>
                </div>
              </FormSection>
            </div>
          ),
        },
        {
          title: "Animaux",
          description:
            "Choisissez les animaux dont la progression sera suivie.",
          icon: PawPrint,
          content: (
            <FormSection
              title="Animaux concernés"
              description="Vous pourrez filtrer et retrouver cet objectif depuis leur suivi."
            >
              <AnimalSelector
                animals={animals}
                selectedIds={values.animaux || []}
                onChange={(ids) =>
                  setValues((previous) => ({ ...previous, animaux: ids }))
                }
                showSelectAll
                onUpdateAnimalImage={onUpdateAnimalImage}
              />
              {errors.animaux && (
                <p className="mt-2 text-xs text-destructive">
                  {errors.animaux}
                </p>
              )}
            </FormSection>
          ),
        },
        {
          title: "Étapes",
          description: "Découpez l’objectif en actions courtes et vérifiables.",
          icon: ListChecks,
          content: (
            <FormSection
              title="Plan d’action"
              description="Au moins une étape est nécessaire. Leur ordre devient votre fil de progression."
            >
              <div className="space-y-2">
                {(values.sousetapes ?? []).map((etape, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <Input
                      aria-label={`Étape ${index + 1}`}
                      value={etape.etape}
                      onChange={(event) =>
                        handleEtapeChange(index, event.target.value)
                      }
                      required
                      placeholder={`Décrire l’étape ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Supprimer l’étape ${index + 1}`}
                      onClick={() => handleRemoveEtape(index)}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={handleAddEtape}
                >
                  <Plus aria-hidden="true" />
                  Ajouter une étape
                </Button>
              </div>
              {errors.sousetapes && (
                <p className="mt-3 text-xs text-destructive" role="alert">
                  {errors.sousetapes}
                </p>
              )}
            </FormSection>
          ),
        },
      ]}
    />
  );
};
