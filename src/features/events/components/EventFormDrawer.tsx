import * as Sentry from "@sentry/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/index";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { useEventForm } from "@/features/events/hooks/use-event-form";
import type { Event } from "@/features/events/types/event";
import { colorsMap, titleMap } from "@/features/events/utils/events";
import { X } from "lucide-react";
import { StarRating } from "@/shared/components/forms/StarRating";
import { AnimalSelector } from "@/features/animals/components/AnimalSelector";
import type { Animal } from "@/features/animals/types/animal";
import { useEffect, useRef, useState } from "react";
import { getLocalDateString } from "@/shared/utils/dates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { deleteOrphanEventFile, uploadEventFile } from "@/features/events/api/event-files";
import { toast } from "sonner";
import type { ImageSigned } from "@/types/image";
import type { Group } from '@/features/groups/types/group';
import type { RecurrenceScope } from '../types/event';
import { getAnimalsAcceptedInEveryGroup, getEligibleEventGroups } from '../utils/event-sharing';
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog';
import { PremiumNotice } from '@/shared/components/feedback/PremiumGate';

type EventFormDrawerProps = {
  open: boolean;
  animals: Animal[] | undefined; // undefined = en cours de chargement
  groups: Group[] | undefined;
  onClose: () => void;
  onSubmit: (data: Partial<Event>, removedDocuments: string[], updateScope: RecurrenceScope) => Promise<void>;
  initialEvent?: Partial<Event>;
  isSubmitting?: boolean;
  isDuplicate?: boolean;
  onUpdateAnimalImage: (id: number, imageObj: ImageSigned) => void;
  isPremium: boolean;
};

export const EventFormDrawer = ({
  open,
  animals,
  groups,
  onClose,
  onSubmit,
  initialEvent,
  isSubmitting = false,
  isDuplicate = false,
  onUpdateAnimalImage,
  isPremium,
}: EventFormDrawerProps) => {
  const {
    values,
    errors,
    handleChange,
    handleTextareaChange,
    handleSubmit,
    setValues,
  } = useEventForm(initialEvent);
  const eventtype = values.eventtype as keyof typeof titleMap;
  const eventTitle = titleMap[eventtype] || "Événement";
  const isEdit = !!initialEvent?.id;
  const isRecurring = Boolean(initialEvent?.idparent || initialEvent?.frequencevalue);
  const [updateScope, setUpdateScope] = useState<RecurrenceScope>('occurrence');

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [removedLinkedFiles, setRemovedLinkedFiles] = useState<string[]>([]);
  const [filePendingRemoval, setFilePendingRemoval] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  const lastStateDateRef = useRef<string | undefined>(initialEvent?.dateevent);

  const visibleLinkedFiles = (isDuplicate ? [] : initialEvent?.documents || []).filter(
    (document) => !removedLinkedFiles.includes(document.name),
  );
  const allFiles = [
    ...visibleLinkedFiles.map(doc => ({ name: doc.name, fromS3: true })),
    ...selectedFiles.map(file => ({ name: file.name, file, fromS3: false }))
  ];

  const maxFiles = 3;
  const filesCount = allFiles.length;
  const filesLeft = maxFiles - filesCount;
  const sharedGroupIds = (values.shared_groups ?? []).map((group) => group.id);
  const eligibleGroups = getEligibleEventGroups(groups ?? [], values.animaux ?? []);
  const selectableAnimals = groups && animals
    ? getAnimalsAcceptedInEveryGroup(animals, groups, sharedGroupIds)
    : animals;
  const canChangeAnimals = !isRecurring || updateScope === 'series';
  const canChangeSharing = !isRecurring || updateScope === 'series';
  const recurrenceValue = ({ tlj: 'daily', tls: 'weekly', tl2s: 'biweekly', tlm: 'monthly' } as Record<string, string>)[values.frequencevalue ?? '']
    ?? values.frequencevalue
    ?? 'none';

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
    if (!values.dateevent || lastStateDateRef.current === values.dateevent) return;
    lastStateDateRef.current = values.dateevent;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(values.dateevent);
    eventDate.setHours(0, 0, 0, 0);

    const proposedState = eventDate < today ? "Terminé" : "À faire";
    setValues((previous) => previous.state === proposedState ? previous : { ...previous, state: proposedState });
  }, [setValues, values.dateevent]);


  // Ajout de fichiers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
    const validFiles = files.filter(
      (file) =>
        allowedTypes.has(file.type) &&
        file.size <= 3 * 1024 * 1024
    );
    if (validFiles.length !== files.length) {
      toast.error("Seuls les fichiers PDF, JPEG ou PNG de 3 Mo maximum sont acceptés.");
    }
    if (filesCount + validFiles.length > maxFiles) {
      toast.error("Vous pouvez sélectionner jusqu'à 3 fichiers maximum.");
      return;
    }
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    // Reset input pour pouvoir re-sélectionner le même fichier si besoin
    if (inputRef.current) inputRef.current.value = "";
  };

  // À l’enregistrement
  const handleSave = async (data: Partial<Event>) => {
    const alreadyUploaded = isDuplicate ? [] : initialEvent?.documents || [];
    const uploadedNames: { name: string }[] = [...alreadyUploaded];
    const filesToUpload: File[] = selectedFiles.filter(
      file => !alreadyUploaded.some(doc => doc.name.endsWith(file.name))
    );
    const uploadedThisSession: string[] = [];

    try {
      // Upload uniquement les nouveaux fichiers
      for (const file of filesToUpload) {
        const fileName = await uploadEventFile(file, isDuplicate ? undefined : initialEvent?.id);
        uploadedNames.push({ name: fileName });
        uploadedThisSession.push(fileName);
      }

      data.documents = uploadedNames;

      if (isDuplicate && data.id) {
        const duplicate = { ...data };
        delete duplicate.id;
        await onSubmit(duplicate, [], 'occurrence');
      } else {
        await onSubmit(data, removedLinkedFiles, updateScope);
      }
    } catch (error) {
      // Rollback : supprime les fichiers uploadés lors de cette session
      await Promise.all(
        uploadedThisSession.map(async (fileName) => {
          try {
            await deleteOrphanEventFile(fileName, isDuplicate ? undefined : initialEvent?.id);
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
      <DialogContent showCloseButton={false} className="max-w-[1200px] w-[90vw] h-[90vh] p-0 flex flex-col rounded-2xl overflow-hidden">
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
            {isRecurring && (
              <fieldset className="rounded-xl border p-4">
                <legend className="px-2 text-sm font-semibold">Portée de la modification</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {([
                    ['occurrence', 'Cette occurrence'],
                    ['following', 'Cette occurrence et les suivantes'],
                    ['series', 'Toute la série'],
                  ] as const).map(([scope, label]) => (
                    <label key={scope} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2">
                      <input type="radio" name="update-scope" value={scope} checked={updateScope === scope}
                        onChange={() => setUpdateScope(scope)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
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
                {selectableAnimals && canChangeAnimals && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Animaux liés</label>
                        <AnimalSelector
                            animals={selectableAnimals}
                            selectedIds={values.animaux || []}
                            onChange={(ids) => setValues((prev) => {
                              const compatibleGroupIds = new Set(getEligibleEventGroups(groups ?? [], ids).map((group) => group.id));
                              return {
                                ...prev,
                                animaux: ids,
                                shared_groups: (prev.shared_groups ?? []).filter((group) => compatibleGroupIds.has(group.id)),
                              };
                            })}
                            showSelectAll={true}
                            onUpdateAnimalImage={onUpdateAnimalImage}
                        />
                        {errors.animaux && (
                            <p className="text-xs text-red-500">{errors.animaux}</p>
                        )}
                    </div>
                )}
                {isRecurring && !canChangeAnimals ? (
                  <p className="md:col-span-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                    Les animaux restent inchangés pour cette portée. Choisissez « Toute la série » pour modifier leur association.
                  </p>
                ) : null}
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
                {(eventtype === "soins" || eventtype === "rdv") && <div className="flex items-center gap-2 mt-2">
                    <input
                        type="checkbox"
                        id="todisplay"
                        name="todisplay"
                        checked={values.todisplay ?? true}
                        onChange={e => setValues(prev => ({ ...prev, todisplay: e.target.checked }))}
                        className="accent-primary w-4 h-4"
                    />
                    <label htmlFor="todisplay" className="text-sm select-none cursor-pointer">
                        Afficher dans le dossier médical
                    </label>
                </div>}
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
                            onChange={(v) => setValues((prev) => ({ ...prev, note: v }))}
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
                    </>
                )}
                {(eventtype === "soins" || eventtype === "balade") && (!isRecurring || updateScope !== 'occurrence') && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Répétition</label>
                    <Select name="frequencevalue" value={recurrenceValue}
                      onValueChange={(value) => setValues((prev) => ({
                        ...prev,
                        frequencevalue: value === 'none' ? undefined : value,
                        frequencetype: value === 'none' ? undefined : 'recurring',
                      }))}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {!isRecurring && <SelectItem value="none">Ne pas répéter</SelectItem>}
                        <SelectItem value="daily">Tous les jours</SelectItem>
                        <SelectItem value="weekly">Toutes les semaines</SelectItem>
                        <SelectItem value="biweekly">Toutes les 2 semaines</SelectItem>
                        <SelectItem value="monthly">Tous les mois</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.frequencevalue && <p className="text-xs text-red-500">{errors.frequencevalue}</p>}
                  </div>
                )}
                {canChangeSharing && groups && (
                  <fieldset className="md:col-span-2 rounded-xl border p-4">
                    <legend className="px-2 text-sm font-semibold">Partager avec des groupes</legend>
                    {eligibleGroups.length ? <div className="grid gap-2 sm:grid-cols-2">
                      {eligibleGroups.map((group) => {
                        const selected = sharedGroupIds.includes(group.id);
                        return <label key={group.id} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2">
                          <input type="checkbox" checked={selected} onChange={(event) => setValues((previous) => ({
                            ...previous,
                            shared_groups: event.target.checked
                              ? [...(previous.shared_groups ?? []), { id: group.id, name: group.name }]
                              : (previous.shared_groups ?? []).filter((candidate) => candidate.id !== group.id),
                          }))} />
                          <span>{group.name}</span>
                        </label>;
                      })}
                    </div> : <p className="text-sm text-muted-foreground">
                      Aucun groupe actif ne contient tous les animaux sélectionnés.
                    </p>}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Seuls les groupes où tous les animaux sont acceptés peuvent recevoir l’événement.
                    </p>
                  </fieldset>
                )}
                {(eventtype === "soins" || eventtype === "rdv") && (
                        <div>
                            {!isPremium ? (
                              <PremiumNotice feature="medicalDocuments" compact />
                            ) : <>
                            <label className="block text-sm font-medium mb-1">Documents (PDF ou images, 3 fichiers maximum, 3 Mo maximum par fichier)</label>
                            <Input
                                ref={inputRef}
                                type="file"
                                name="documents"
                                accept="application/pdf,image/jpeg,image/png"
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
                                                        setFilePendingRemoval(fileObj.name);
                                                    } else {
                                                        setSelectedFiles(prev => prev.filter((_, i) => i !== idx - visibleLinkedFiles.length));
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
                            </>}
                        </div>
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
      <ConfirmDialog open={Boolean(filePendingRemoval)} title="Retirer ce document médical ?"
        description="Le document sera supprimé définitivement lors de l’enregistrement."
        confirmLabel="Retirer" onCancel={() => setFilePendingRemoval(undefined)} onConfirm={() => {
          if (filePendingRemoval) setRemovedLinkedFiles((previous) => previous.includes(filePendingRemoval) ? previous : [...previous, filePendingRemoval]);
          setFilePendingRemoval(undefined);
        }} />
    </Dialog>
  );
};
