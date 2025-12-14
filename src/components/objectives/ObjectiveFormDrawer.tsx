import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { AnimalSelector } from "../ui/AnimalSelector";
import { Animal } from "@/types/animal";
import { Objective } from "@/types/objective";
import { ImageSigned } from "@/types/image";
import { useObjectiveForm } from "@/hooks/useObjectiveForm";
import { getLocalDateString } from "@/utils/datesUtils";
import { X } from "lucide-react";

type ObjectiveFormDrawerProps = {
  open: boolean;
  animals: Animal[] | undefined;
  onClose: () => void;
  onSubmit: (data: Partial<Objective>) => void;
  isSubmitting?: boolean;
  initialObjective?: Partial<Objective>;
  onUpdateAnimalImage: (id: number, imageObj: ImageSigned) => void;
};

export const ObjectiveFormDrawer = ({
  open,
  animals,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialObjective,
  onUpdateAnimalImage,
}: ObjectiveFormDrawerProps) => {
const {
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
  } = useObjectiveForm(initialObjective);

  const isEdit = !!initialObjective?.id;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-[1200px] w-[90vw] h-[90vh] p-0 flex flex-col rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 py-4 flex flex-row items-center justify-between">
          <DialogTitle>{isEdit ? "Modifier l'objectif" : "Créer un objectif"}</DialogTitle>
          <Button
            onClick={onClose}
            className="p-2 rounded hover:bg-white/20 text-white"
            variant="ghost"
            type="button"
            tabIndex={0}
            aria-label="Fermer"
          >
            <X size={20} />
          </Button>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Titre *</label>
            <Input value={values.title} name="title" onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Animaux concernés *</label>
            <AnimalSelector
              animals={animals}
              selectedIds={values.animaux || []}
              onChange={(ids) => setValues((prev) => ({ ...prev, animaux: ids }))}
              showSelectAll={true}
              onUpdateAnimalImage={onUpdateAnimalImage}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Date de début *</label>
              <Input type="date" name="datedebut" value={values.datedebut
                                  ? values.datedebut.slice(0, 10)
                                  : getLocalDateString()} onChange={handleChange} required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Date de fin *</label>
              <Input type="date" name="datefin" value={values.datefin
                                  ? values.datefin.slice(0, 10)
                                  : getLocalDateString()} onChange={handleChange} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Étapes de l'objectif *</label>
            <div className="flex flex-col gap-2">
              {(values.sousetapes ?? []).map((etape, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    value={etape.etape}
                    onChange={e => handleEtapeChange(idx, e.target.value)}
                    required
                    placeholder={`Étape ${idx + 1}`}
                  />
                  <Button type="button" variant="ghost" onClick={() => handleRemoveEtape(idx)}>
                    Supprimer
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddEtape}>
                Ajouter une étape
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEdit ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};