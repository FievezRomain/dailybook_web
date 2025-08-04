import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/index";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useEventForm } from "@/hooks/useEventForm";
import type { Event } from "@/types/event";

type EventFormDrawerProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Event>) => void;
  initialEvent?: Partial<Event>;
  isSubmitting?: boolean;
  isDuplicate?: boolean;
};

export const EventFormDrawer = ({
  open,
  onClose,
  onSubmit,
  initialEvent,
  isSubmitting = false,
  isDuplicate = false,
}: EventFormDrawerProps) => {
  const {
    values,
    errors,
    handleChange,
    handleTextareaChange,
    handleSubmit,
    resetForm,
    setValues,
  } = useEventForm(initialEvent);

  // Détermine le titre et le bouton selon le mode
  const getTitle = () => {
    if (isDuplicate) return "Dupliquer l'événement";
    if (initialEvent?.id) return "Modifier l'événement";
    return "Créer un événement";
  };
  const getButtonLabel = () => {
    if (isSubmitting) {
      if (isDuplicate) return "Duplication...";
      if (initialEvent?.id) return "Enregistrement...";
      return "Création...";
    }
    if (isDuplicate) return "Dupliquer";
    if (initialEvent?.id) return "Enregistrer";
    return "Créer";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0 flex flex-col h-[90vh] rounded-2xl overflow-hidden">
        <DialogHeader className="bg-primary/90 px-6 py-4">
          <DialogTitle className="text-white text-lg">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        <form
          className="flex-1 overflow-y-auto p-6 flex flex-col gap-6"
          onSubmit={handleSubmit((data) => {
            // On retire l'id si duplication
            if (isDuplicate && data.id) {
              const { id, ...rest } = data;
              onSubmit(rest);
            } else {
              onSubmit(data);
            }
          })}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom *</label>
              <Input
                name="nom"
                value={values.nom || ""}
                onChange={handleChange}
                required
                autoFocus
                placeholder="Nom de l'événement"
              />
              {errors.nom && <p className="text-xs text-red-500">{errors.nom}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <Input
                name="eventtype"
                value={values.eventtype || ""}
                onChange={handleChange}
                required
                placeholder="Type d'événement"
              />
              {errors.eventtype && <p className="text-xs text-red-500">{errors.eventtype}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <Input
                type="date"
                name="dateevent"
                value={values.dateevent || ""}
                onChange={handleChange}
                required
              />
              {errors.dateevent && <p className="text-xs text-red-500">{errors.dateevent}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">État</label>
              <Input
                name="state"
                value={values.state || ""}
                onChange={handleChange}
                placeholder="État"
              />
            </div>
            {/* Ajoute ici d'autres champs selon tes besoins */}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Commentaire</label>
            <Textarea
              name="commentaire"
              value={values.commentaire || ""}
              onChange={handleTextareaChange}
              placeholder="Ajouter un commentaire"
              rows={3}
            />
          </div>
          {/* Ajoute ici d'autres champs spécifiques (animaux, documents, etc.) */}
          <DialogFooter className="mt-auto flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" variant={"default"} disabled={isSubmitting}>
              {getButtonLabel()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};