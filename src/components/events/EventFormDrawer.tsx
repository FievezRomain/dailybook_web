import * as Sentry from "@sentry/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/index";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useEventForm } from "@/hooks/useEventForm";
import type { Event } from "@/types/event";
import { colorsMap, titleMap } from "@/utils/eventsUtils";
import { X } from "lucide-react";
import { StarRating } from "../ui/StarRating";
import { AnimalSelector } from "../ui/AnimalSelector";
import { Animal } from "@/types/animal";
import { useEffect, useRef, useState } from "react";
import { getLocalDateString } from "@/utils/datesUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { deleteFromStorage, getPresignedUrl, uploadToStorage } from "@/services/storage";
import { toast } from "sonner";

type EventFormDrawerProps = {
  open: boolean;
  animals: Animal[] | undefined; // undefined = en cours de chargement
  onClose: () => void;
  onSubmit: (data: Partial<Event>) => void;
  initialEvent?: Partial<Event>;
  isSubmitting?: boolean;
  isDuplicate?: boolean;
};

export const EventFormDrawer = ({
  open,
  animals,
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
  const eventtype = values.eventtype as keyof typeof titleMap;
  const eventTitle = titleMap[eventtype] || "Événement";
  const isEdit = !!initialEvent?.id;

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const allFiles = [
    ...(initialEvent?.documents?.map(doc => ({ name: doc.name, fromS3: true })) || []),
    ...selectedFiles.map(file => ({ name: file.name, file, fromS3: false }))
  ];

  const maxFiles = 3;
  const filesCount = allFiles.length;
  const filesLeft = maxFiles - filesCount;

  const [removedLinkedFiles, setRemovedLinkedFiles] = useState<string[]>([]);

  // Détermine le titre et le bouton selon le mode
  const getTitle = () => {
    if (isDuplicate) return `Dupliquer l'événement ${eventTitle.toLocaleLowerCase()}`;
    if (isEdit) return `Modifier l'événement ${eventTitle.toLocaleLowerCase()}`;
    return `Créer un événement ${eventTitle.toLocaleLowerCase()}`;
  };
  const getButtonLabel = () => {
    if (isSubmitting) {
      if (isDuplicate) return "Duplication...";
      if (isEdit) return "Enregistrement...";
      return "Création...";
    }
    if (isDuplicate) return "Dupliquer";
    if (isEdit) return "Enregistrer";
    return "Créer";
  };

  // Récupère la couleur selon le type d'event
  const colorVar = colorsMap[values.eventtype as keyof typeof colorsMap];
  const headerBg = colorVar ? `rgba(var(${colorVar}), 1)` : "#A3A3A3";

  // Met à jour l'état selon la date
  useEffect(() => {
    if (!values.dateevent) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(values.dateevent);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate < today && values.state !== "Terminé") {
      setValues((prev) => ({ ...prev, state: "Terminé" }));
    } else if (eventDate >= today && values.state !== "À faire") {
      setValues((prev) => ({ ...prev, state: "À faire" }));
    }
  }, [values.dateevent]);

  useEffect(() => {
    // Quand le drawer s'ouvre ou que l'event change, reset les fichiers sélectionnés
    setSelectedFiles([]);

    // Réinitialisation des fichiers supprimés
    setRemovedLinkedFiles([]);
  }, [open, initialEvent?.id]);


  // Ajout de fichiers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) =>
        (file.type.startsWith("image/") || file.type === "application/pdf") &&
        file.size <= 3 * 1024 * 1024
    );
    if (selectedFiles.length + validFiles.length > 3) {
      alert("Vous pouvez sélectionner jusqu'à 3 fichiers maximum.");
      return;
    }
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    // Reset input pour pouvoir re-sélectionner le même fichier si besoin
    if (inputRef.current) inputRef.current.value = "";
  };

  // Suppression d’un fichier
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // À l’enregistrement
  const handleSave = async (data: Partial<Event>) => {
    const alreadyUploaded = initialEvent?.documents || [];
    const uploadedNames: { name: string }[] = [...alreadyUploaded];
    const filesToUpload: File[] = selectedFiles.filter(
      file => !alreadyUploaded.some(doc => doc.name.endsWith(file.name))
    );
    const uploadedThisSession: string[] = [];

    try {
      // Upload uniquement les nouveaux fichiers
      for (const file of filesToUpload) {
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, "_")}`;
        const presignedUrl = await getPresignedUrl(fileName, file.type, "event");
        await uploadToStorage(file, presignedUrl);
        uploadedNames.push({ name: fileName });
        uploadedThisSession.push(fileName);
      }

      // Suppression des fichiers retirés (en modification uniquement)
      for (const fileName of removedLinkedFiles) {
          await deleteFromStorage(fileName);
      }

      data.documents = uploadedNames;

      if (isDuplicate && data.id) {
        const { id, ...rest } = data;
        await onSubmit(rest);
      } else {
        await onSubmit(data);
      }
    } catch (error) {
      // Rollback : supprime les fichiers uploadés lors de cette session
      await Promise.all(
        uploadedThisSession.map(async (fileName) => {
          try {
            await deleteFromStorage(fileName);
          } catch (e) {
            toast.error("Une erreur est survenue lors du rollback de l'enregistrement des fichiers suite à une erreur du serveur.");
            Sentry.captureException(e);
          }
        })
      );
      toast.error("Une erreur est survenue lors de l'enregistrement ou de l'upload des fichiers.");
      Sentry.captureException(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-[1200px] w-[90vw] h-[90vh] p-0 flex flex-col  rounded-2xl overflow-hidden">
        <DialogHeader
          className="px-6 py-4 flex flex-row items-center justify-between"
          style={{ backgroundColor: headerBg }}
        >
          <DialogTitle className="text-white text-lg">{getTitle()}</DialogTitle>
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
        <form
          className="flex-1 overflow-y-auto p-6 flex flex-col gap-6"
          onSubmit={handleSubmit(handleSave)}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">État</label>
                    <div className="flex w-fit overflow-hidden border border-muted rounded-xl">
                        <button
                            type="button"
                            className={`px-4 py-1 font-semibold transition-colors
                                ${values.state !== "Terminé"
                                ? "text-white"
                                : "text-muted-foreground bg-muted"}
                                rounded-l-xl
                                `}
                            style={
                                values.state !== "Terminé" && colorVar
                                ? { backgroundColor: `rgba(var(${colorVar}), 1)` }
                                : undefined
                            }
                            onClick={() => setValues((prev) => ({ ...prev, state: "À faire" }))}
                            aria-pressed={values.state !== "Terminé"}
                        >
                            À faire
                        </button>
                        <button
                            type="button"
                            className={`px-4 py-1 font-semibold transition-colors
                                ${values.state === "Terminé"
                                ? "text-white"
                                : "text-muted-foreground bg-muted"}
                                rounded-r-xl
                                `}
                            style={
                                values.state === "Terminé" && colorVar
                                ? { backgroundColor: `rgba(var(${colorVar}), 1)` }
                                : undefined
                            }
                            onClick={() => setValues((prev) => ({ ...prev, state: "Terminé" }))}
                            aria-pressed={values.state === "Terminé"}
                        >
                            Terminé
                        </button>
                    </div>
                </div>
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
                    <label className="block text-sm font-medium mb-1">Date *</label>
                    <Input
                        type="date"
                        name="dateevent"
                        value={values.dateevent || getLocalDateString()}
                        onChange={handleChange}
                        required
                    />
                    {errors.dateevent && <p className="text-xs text-red-500">{errors.dateevent}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Heure de début</label>
                    <Input
                        type="time"
                        name="heuredebutevent"
                        value={values.heuredebutevent || ""}
                        onChange={handleChange}
                    />
                </div>
                {/* Sélection des animaux */}
                {animals && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Animaux liés</label>
                        <AnimalSelector
                            animals={animals}
                            selectedIds={values.animaux || []}
                            onChange={(ids) => setValues((prev) => ({ ...prev, animaux: ids }))}
                            showSelectAll={true}
                        />
                        {errors.animaux && (
                            <p className="text-xs text-red-500">{errors.animaux}</p>
                        )}
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium mb-1">Lieu</label>
                    <Input
                        name="lieu"
                        value={values.lieu || ""}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Dépense</label>
                    <Input
                        type="number"
                        name="depense"
                        value={values.depense || ""}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        pattern="[0-9]*[.,]?[0-9]*"
                    />
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <input
                        type="checkbox"
                        id="todisplay"
                        name="todisplay"
                        checked={!!values.todisplay}
                        onChange={e => setValues(prev => ({ ...prev, todisplay: e.target.checked }))}
                        className="accent-primary w-4 h-4"
                    />
                    <label htmlFor="todisplay" className="text-sm select-none cursor-pointer">
                        Afficher cet événement dans le calendrier
                    </label>
                </div>
                {/* Champs conditionnels */}
                {(eventtype === "soins" || eventtype === "rdv") && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Spécialiste</label>
                        <Input name="specialiste" value={values.specialiste || ""} onChange={handleChange} />
                    </div>
                )}
                {eventtype === "depense" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Catégorie de dépense</label>
                    <Select
                      name="categoriedepense"
                      value={values.categoriedepense || ""}
                      onValueChange={value => setValues(prev => ({ ...prev, categoriedepense: value }))}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alimentation">Alimentation</SelectItem>
                        <SelectItem value="equipement">Équipement</SelectItem>
                        <SelectItem value="accessoire">Accessoire</SelectItem>
                        <SelectItem value="garde">Service de garde / Pension</SelectItem>
                        <SelectItem value="formation">Formation</SelectItem>
                        <SelectItem value="assurance">Assurance</SelectItem>
                        <SelectItem value="balade">Balade</SelectItem>
                        <SelectItem value="entrainement">Entraînement</SelectItem>
                        <SelectItem value="concours">Concours</SelectItem>
                        <SelectItem value="rdv">Rendez-vous</SelectItem>
                        <SelectItem value="soins">Soin</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.categoriedepense && (
                      <p className="text-xs text-red-500">{errors.categoriedepense}</p>
                    )}
                  </div>
                )}
                {eventtype === "balade" && (
                <>
                    <div>
                        <label className="block text-sm font-medium mb-1">Heure début balade</label>
                        <Input name="heuredebutbalade" value={values.heuredebutbalade || ""} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Date fin balade</label>
                        <Input type="date" name="datefinbalade" value={values.datefinbalade || ""} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Heure fin balade</label>
                        <Input type="time" name="heurefinbalade" value={values.heurefinbalade || ""} onChange={handleChange} />
                    </div>
                </>
                )}
                {eventtype === "entrainement" && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Discipline</label>
                        <Input name="discipline" value={values.discipline || ""} onChange={handleChange} />
                    </div>
                )}
                {eventtype !== "depense" && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Note</label>
                        <StarRating
                            value={Number(values.note) || 0}
                            onChange={(v) => setValues((prev) => ({ ...prev, note: v.toString() }))}
                            color={colorVar ? `rgba(var(${colorVar}), 1)` : undefined}
                        />
                    </div>
                )}
                {eventtype === "concours" && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Épreuve</label>
                            <Input name="epreuve" value={values.epreuve || ""} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Dossart</label>
                            <Input name="dossart" value={values.dossart || ""} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Placement</label>
                            <Input name="placement" value={values.placement || ""} onChange={handleChange} />
                        </div>
                    </>
                )}
                {eventtype === "soins" && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Traitement</label>
                            <Input name="traitement" value={values.traitement || ""} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date fin soins</label>
                            <Input type="date" name="datefinsoins" value={values.datefinsoins || ""} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fréquence</label>
                            <Select
                                name="frequencevalue"
                                value={values.frequencevalue || ""}
                                onValueChange={value => setValues(prev => ({ ...prev, frequencevalue: value }))}
                                required
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sélectionner une fréquence" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tlj2">Le jour J</SelectItem>
                                    <SelectItem value="tlj">Tous les jours</SelectItem>
                                    <SelectItem value="tls">Toutes les semaines</SelectItem>
                                    <SelectItem value="tl2s">Toutes les 2 semaines</SelectItem>
                                    <SelectItem value="tlm">Tous les mois</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.frequencevalue && (
                                <p className="text-xs text-red-500">{errors.frequencevalue}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Documents (PDF ou images, 3 fichiers maximum, 3 Mo maximum par fichier)</label>
                            <Input
                                ref={inputRef}
                                type="file"
                                name="documents"
                                accept="application/pdf,image/*"
                                multiple
                                onChange={handleFileChange}
                                disabled={filesLeft <= 0}
                            />
                                <ul className="mt-1 text-xs text-muted-foreground">
                                    {allFiles.map((fileObj, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            {fileObj.name}
                                            <button
                                                type="button"
                                                className="text-red-500 ml-2"
                                                onClick={() => {
                                                    if (fileObj.fromS3) {
                                                        setRemovedLinkedFiles(prev => [...prev, fileObj.name]);
                                                    } else {
                                                        setSelectedFiles(prev => prev.filter((_, i) => i !== idx - (initialEvent?.documents?.length || 0)));
                                                    }
                                                }}
                                                aria-label="Supprimer ce fichier"
                                            >
                                                Supprimer
                                            </button>
                                            {fileObj.fromS3 && <span className="ml-2 text-green-600">(déjà lié)</span>}
                                        </li>
                                    ))}
                                </ul>
                                {errors.documents && (
                                    <p className="text-xs text-red-500">{errors.documents}</p>
                                )}
                        </div>
                    </>
                )}
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
            <Button type="submit" variant={"outline"} disabled={isSubmitting}>
              {getButtonLabel()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};