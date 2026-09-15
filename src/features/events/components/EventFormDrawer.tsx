import * as Sentry from "@sentry/react";
import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  ListChecks,
  PawPrint,
} from "lucide-react";
import { toast } from "sonner";

import { AnimalSelector } from "@/features/animals/components/AnimalSelector";
import type { Animal } from "@/features/animals/types/animal";
import {
  deleteOrphanEventFile,
  uploadEventFile,
} from "@/features/events/api/event-files";
import { useEventForm } from "@/features/events/hooks/use-event-form";
import type { Event, RecurrenceScope } from "@/features/events/types/event";
import {
  eventToneClasses,
  iconsMap,
  titleMap,
} from "@/features/events/utils/events";
import type { Group } from "@/features/groups/types/group";
import { ConfirmDialog } from "@/shared/components/feedback/ConfirmDialog";
import { PremiumNotice } from "@/shared/components/feedback/PremiumGate";
import {
  FormSection,
  SteppedFormSheet,
} from "@/shared/components/forms/SteppedFormSheet";
import { StarRating } from "@/shared/components/forms/StarRating";
import { Button } from "@/shared/components/ui/button";
import { DateInput, TimeInput } from "@/shared/components/ui/form-feedback";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { getLocalDateString } from "@/shared/utils/dates";
import type { ImageSigned } from "@/types/image";
import {
  getAnimalsAcceptedInEveryGroup,
  getEligibleEventGroups,
} from "../utils/event-sharing";
import { RecurrenceScopeSelector } from "./RecurrenceScopeSelector";

type EventFormDrawerProps = {
  open: boolean;
  animals: Animal[] | undefined;
  groups: Group[] | undefined;
  onClose: () => void;
  onSubmit: (
    data: Partial<Event>,
    removedDocuments: string[],
    updateScope: RecurrenceScope,
  ) => Promise<void>;
  initialEvent?: Partial<Event>;
  isSubmitting?: boolean;
  isDuplicate?: boolean;
  onUpdateAnimalImage: (id: number, imageObj: ImageSigned) => void;
  isPremium: boolean;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

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
  const EventTypeIcon = iconsMap[eventtype] || CalendarDays;
  const isEdit = Boolean(initialEvent?.id);
  const isRecurring = Boolean(
    initialEvent?.idparent || initialEvent?.frequencevalue,
  );
  const [updateScope, setUpdateScope] = useState<RecurrenceScope>("occurrence");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [removedLinkedFiles, setRemovedLinkedFiles] = useState<string[]>([]);
  const [filePendingRemoval, setFilePendingRemoval] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  const lastStateDateRef = useRef(initialEvent?.dateevent);

  const visibleLinkedFiles = (
    isDuplicate ? [] : initialEvent?.documents || []
  ).filter((document) => !removedLinkedFiles.includes(document.name));
  const allFiles = [
    ...visibleLinkedFiles.map((document) => ({
      name: document.name,
      fromS3: true,
    })),
    ...selectedFiles.map((file) => ({ name: file.name, fromS3: false })),
  ];
  const filesLeft = 3 - allFiles.length;
  const sharedGroupIds = (values.shared_groups ?? []).map((group) => group.id);
  const eligibleGroups = getEligibleEventGroups(
    groups ?? [],
    values.animaux ?? [],
  );
  const selectableAnimals =
    groups && animals
      ? getAnimalsAcceptedInEveryGroup(animals, groups, sharedGroupIds)
      : animals;
  const canChangeAnimals = !isRecurring || updateScope === "series";
  const canChangeSharing = !isRecurring || updateScope === "series";
  const recurrenceValue =
    (
      {
        tlj: "daily",
        tls: "weekly",
        tl2s: "biweekly",
        tlm: "monthly",
      } as Record<string, string>
    )[values.frequencevalue ?? ""] ??
    values.frequencevalue ??
    "none";
  const toneClass = eventToneClasses[eventtype] ?? eventToneClasses.autre;

  useEffect(() => {
    if (!values.dateevent || lastStateDateRef.current === values.dateevent)
      return;
    lastStateDateRef.current = values.dateevent;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(values.dateevent);
    selectedDate.setHours(0, 0, 0, 0);
    const proposedState = selectedDate < today ? "Terminé" : "À faire";
    setValues((previous) =>
      previous.state === proposedState
        ? previous
        : { ...previous, state: proposedState },
    );
  }, [setValues, values.dateevent]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(
      (file) =>
        ["application/pdf", "image/jpeg", "image/png"].includes(file.type) &&
        file.size <= 3 * 1024 * 1024,
    );
    if (validFiles.length !== files.length)
      toast.error(
        "Seuls les fichiers PDF, JPEG ou PNG de 3 Mo maximum sont acceptés.",
      );
    if (allFiles.length + validFiles.length > 3) {
      toast.error("Vous pouvez sélectionner jusqu’à 3 fichiers.");
      return;
    }
    setSelectedFiles((previous) => [...previous, ...validFiles]);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSave(data: Partial<Event>) {
    const alreadyUploaded = isDuplicate ? [] : initialEvent?.documents || [];
    const uploadedNames = [...alreadyUploaded];
    const uploadedThisSession: string[] = [];
    try {
      for (const file of selectedFiles) {
        const fileName = await uploadEventFile(
          file,
          isDuplicate ? undefined : initialEvent?.id,
        );
        uploadedNames.push({ name: fileName });
        uploadedThisSession.push(fileName);
      }
      data.documents = uploadedNames.filter(
        (document) => !removedLinkedFiles.includes(document.name),
      );
      if (isDuplicate && data.id) {
        const duplicate = { ...data };
        delete duplicate.id;
        await onSubmit(duplicate, [], "occurrence");
      } else await onSubmit(data, removedLinkedFiles, updateScope);
    } catch (error) {
      await Promise.all(
        uploadedThisSession.map(async (fileName) => {
          try {
            await deleteOrphanEventFile(
              fileName,
              isDuplicate ? undefined : initialEvent?.id,
            );
          } catch (rollbackError) {
            Sentry.captureException(rollbackError);
          }
        }),
      );
      toast.error(
        "Une erreur est survenue lors de l’enregistrement ou de l’envoi des fichiers.",
      );
      Sentry.captureException(error);
    }
  }

  const title = isDuplicate
    ? `Dupliquer ${eventTitle.toLocaleLowerCase("fr-FR")}`
    : isEdit
      ? `Modifier ${eventTitle.toLocaleLowerCase("fr-FR")}`
      : "Créer un événement";
  const submitLabel = isDuplicate
    ? "Dupliquer l’événement"
    : isEdit
      ? "Enregistrer les modifications"
      : "Créer l’événement";

  return (
    <>
      <SteppedFormSheet
        open={open}
        onClose={onClose}
        onSubmit={handleSubmit(handleSave)}
        title={title}
        eyebrow="Agenda"
        description="Planifiez l’essentiel, choisissez les animaux puis complétez uniquement les informations utiles à ce type d’événement."
        submitLabel={submitLabel}
        submitting={isSubmitting}
        toneClassName={toneClass}
        steps={[
          ...(!isEdit
            ? [
                {
                  title: "Type",
                  description:
                    "Choisissez l’événement que vous souhaitez ajouter.",
                  icon: CalendarDays,
                  validate: () => Boolean(values.eventtype),
                  validationMessage:
                    "Choisissez un type d’événement pour continuer.",
                  content: ({ advance }: { advance: () => void }) => (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Object.entries(titleMap).map(([value, label]) => {
                        const TypeIcon = iconsMap[value] || CalendarDays;
                        const selected = values.eventtype === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            disabled={isSubmitting}
                            aria-pressed={selected}
                            className={`${eventToneClasses[value]} group relative flex min-h-24 items-center gap-4 overflow-hidden rounded-[20px] border bg-card p-4 text-left shadow-sm transition-[border-color,background-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-[var(--event-color)] hover:shadow-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? "border-[var(--event-color)] bg-[color-mix(in_oklab,var(--event-color)_8%,var(--card))]" : "border-border/70"}`}
                            onClick={() => {
                              setValues((previous) => ({
                                ...previous,
                                eventtype: value,
                              }));
                              advance();
                            }}
                          >
                            <span className="event-detail-type-icon grid size-12 shrink-0 place-items-center rounded-[16px]">
                              <TypeIcon className="size-5" aria-hidden="true" />
                            </span>
                            <span>
                              <span className="block font-semibold">
                                {label}
                              </span>
                              <span className="mt-1 block text-xs text-muted-foreground">
                                Sélectionner et continuer
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ),
                },
              ]
            : []),
          {
            title: "Essentiel",
            description: "Intitulé, état et moment de l’événement.",
            icon: CalendarDays,
            content: (
              <div className="space-y-4">
                <FormSection title="Nature de l’événement">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {isEdit ? (
                      <Field label="Type d’événement *">
                        <Select
                          value={values.eventtype || ""}
                          onValueChange={(value) =>
                            setValues((previous) => ({
                              ...previous,
                              eventtype: value,
                            }))
                          }
                          required
                        >
                          <SelectTrigger
                            className="w-full"
                            aria-invalid={Boolean(errors.eventtype)}
                          >
                            <SelectValue placeholder="Choisir un type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(titleMap).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.eventtype && (
                          <span className="text-xs text-destructive">
                            {errors.eventtype}
                          </span>
                        )}
                      </Field>
                    ) : (
                      <div className="grid gap-1.5">
                        <span className="text-sm font-medium">
                          Type d’événement *
                        </span>
                        <div
                          data-slot="event-type-summary"
                          aria-label={`Type d’événement sélectionné : ${eventTitle}`}
                          className={`${toneClass} flex h-10 items-center gap-2 rounded-surface border border-foreground/60 bg-card px-3.5 text-[13px] font-medium`}
                        >
                          <EventTypeIcon
                            className="size-4 text-[var(--event-color)]"
                            aria-hidden="true"
                          />
                          <span>{eventTitle}</span>
                        </div>
                      </div>
                    )}
                    <Field label="État">
                      <div className="grid grid-cols-2 rounded-control border bg-muted/30 p-1">
                        <button
                          type="button"
                          onClick={() =>
                            setValues((previous) => ({
                              ...previous,
                              state: "À faire",
                            }))
                          }
                          aria-pressed={values.state !== "Terminé"}
                          className={`min-h-9 rounded-[10px] text-sm font-semibold transition-colors ${values.state !== "Terminé" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          À faire
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setValues((previous) => ({
                              ...previous,
                              state: "Terminé",
                            }))
                          }
                          aria-pressed={values.state === "Terminé"}
                          className={`min-h-9 rounded-[10px] text-sm font-semibold transition-colors ${values.state === "Terminé" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          Terminé
                        </button>
                      </div>
                    </Field>
                  </div>
                </FormSection>
                <FormSection title="Quand et où">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nom *">
                      <Input
                        name="nom"
                        value={values.nom || ""}
                        onChange={handleChange}
                        required
                        placeholder="Ex. Vaccin annuel"
                        aria-invalid={Boolean(errors.nom)}
                      />
                      {errors.nom && (
                        <span className="text-xs text-destructive">
                          {errors.nom}
                        </span>
                      )}
                    </Field>
                    <Field label="Date *">
                      <DateInput
                        name="dateevent"
                        value={values.dateevent || getLocalDateString()}
                        onChange={handleChange}
                        required
                        aria-invalid={Boolean(errors.dateevent)}
                      />
                      {errors.dateevent && (
                        <span className="text-xs text-destructive">
                          {errors.dateevent}
                        </span>
                      )}
                    </Field>
                    <Field label="Heure de début">
                      <TimeInput
                        name="heuredebutevent"
                        value={values.heuredebutevent || ""}
                        onChange={handleChange}
                      />
                    </Field>
                    <Field label="Lieu">
                      <Input
                        name="lieu"
                        value={values.lieu || ""}
                        onChange={handleChange}
                        placeholder="Adresse ou lieu"
                      />
                    </Field>
                  </div>
                </FormSection>
              </div>
            ),
          },
          {
            title: "Animaux",
            description:
              "Associez les animaux et, si nécessaire, partagez avec vos groupes.",
            icon: PawPrint,
            validate: () => Boolean(values.animaux?.length),
            validationMessage:
              "Sélectionnez au moins un animal pour continuer.",
            content: (
              <div className="space-y-4">
                {isRecurring && (
                  <RecurrenceScopeSelector
                    value={updateScope}
                    onChange={setUpdateScope}
                  />
                )}
                <FormSection
                  title="Animaux concernés"
                  description="Le sélecteur reste local à cet événement."
                >
                  {selectableAnimals && canChangeAnimals ? (
                    <AnimalSelector
                      animals={selectableAnimals}
                      selectedIds={values.animaux || []}
                      onChange={(ids) =>
                        setValues((previous) => {
                          const compatibleGroupIds = new Set(
                            getEligibleEventGroups(groups ?? [], ids).map(
                              (group) => group.id,
                            ),
                          );
                          return {
                            ...previous,
                            animaux: ids,
                            shared_groups: (
                              previous.shared_groups ?? []
                            ).filter((group) =>
                              compatibleGroupIds.has(group.id),
                            ),
                          };
                        })
                      }
                      showSelectAll
                      onUpdateAnimalImage={onUpdateAnimalImage}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Les animaux restent inchangés pour cette portée.
                      Choisissez toute la série pour les modifier.
                    </p>
                  )}
                  {errors.animaux && (
                    <p className="mt-2 text-xs text-destructive">
                      {errors.animaux}
                    </p>
                  )}
                </FormSection>
                {canChangeSharing && groups && (
                  <FormSection
                    title="Partage"
                    description="Seuls les groupes acceptant tous les animaux sélectionnés sont proposés."
                  >
                    {eligibleGroups.length ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {eligibleGroups.map((group) => (
                          <label
                            key={group.id}
                            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-control border px-3"
                          >
                            <input
                              type="checkbox"
                              checked={sharedGroupIds.includes(group.id)}
                              onChange={(changeEvent) =>
                                setValues((previous) => ({
                                  ...previous,
                                  shared_groups: changeEvent.target.checked
                                    ? [
                                        ...(previous.shared_groups ?? []),
                                        { id: group.id, name: group.name },
                                      ]
                                    : (previous.shared_groups ?? []).filter(
                                        (candidate) =>
                                          candidate.id !== group.id,
                                      ),
                                }))
                              }
                            />
                            <span className="text-sm font-medium">
                              {group.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Aucun groupe compatible pour cette sélection.
                      </p>
                    )}
                  </FormSection>
                )}
              </div>
            ),
          },
          {
            title: "Détails",
            description: `Complétez les informations propres au type ${eventTitle.toLocaleLowerCase("fr-FR")}.`,
            icon: ListChecks,
            content: (
              <div className="space-y-4">
                <FormSection title="Informations complémentaires">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Dépense">
                      <Input
                        type="number"
                        name="depense"
                        value={values.depense || ""}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                      />
                    </Field>
                    {(eventtype === "soins" || eventtype === "rdv") && (
                      <Field label="Spécialiste">
                        <Input
                          name="specialiste"
                          value={values.specialiste || ""}
                          onChange={handleChange}
                        />
                      </Field>
                    )}
                    {eventtype === "depense" && (
                      <Field label="Catégorie de dépense *">
                        <Select
                          value={values.categoriedepense || ""}
                          onValueChange={(value) =>
                            setValues((previous) => ({
                              ...previous,
                              categoriedepense: value,
                            }))
                          }
                          required
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choisir une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "alimentation",
                              "equipement",
                              "accessoire",
                              "garde",
                              "formation",
                              "assurance",
                              "balade",
                              "entrainement",
                              "concours",
                              "rdv",
                              "soins",
                              "autre",
                            ].map((value) => (
                              <SelectItem key={value} value={value}>
                                {value.charAt(0).toUpperCase() + value.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                    {eventtype === "balade" && (
                      <>
                        <Field label="Heure de début de balade">
                          <TimeInput
                            name="heuredebutbalade"
                            value={values.heuredebutbalade || ""}
                            onChange={handleChange}
                          />
                        </Field>
                        <Field label="Date de fin">
                          <DateInput
                            name="datefinbalade"
                            value={values.datefinbalade || ""}
                            onChange={handleChange}
                          />
                        </Field>
                        <Field label="Heure de fin">
                          <TimeInput
                            name="heurefinbalade"
                            value={values.heurefinbalade || ""}
                            onChange={handleChange}
                          />
                        </Field>
                      </>
                    )}
                    {eventtype === "entrainement" && (
                      <Field label="Discipline">
                        <Input
                          name="discipline"
                          value={values.discipline || ""}
                          onChange={handleChange}
                        />
                      </Field>
                    )}
                    {eventtype === "concours" && (
                      <>
                        <Field label="Épreuve">
                          <Input
                            name="epreuve"
                            value={values.epreuve || ""}
                            onChange={handleChange}
                          />
                        </Field>
                        <Field label="Dossard">
                          <Input
                            name="dossart"
                            value={values.dossart || ""}
                            onChange={handleChange}
                          />
                        </Field>
                        <Field label="Classement">
                          <Input
                            name="placement"
                            value={values.placement || ""}
                            onChange={handleChange}
                          />
                        </Field>
                      </>
                    )}
                    {eventtype === "soins" && (
                      <>
                        <Field label="Traitement">
                          <Input
                            name="traitement"
                            value={values.traitement || ""}
                            onChange={handleChange}
                          />
                        </Field>
                        <Field label="Fin des soins">
                          <DateInput
                            name="datefinsoins"
                            value={values.datefinsoins || ""}
                            onChange={handleChange}
                          />
                        </Field>
                      </>
                    )}
                    {eventtype !== "depense" && (
                      <div>
                        <span className="mb-1.5 block text-sm font-medium">
                          Note
                        </span>
                        <StarRating
                          value={Number(values.note) || 0}
                          onChange={(note) =>
                            setValues((previous) => ({ ...previous, note }))
                          }
                        />
                      </div>
                    )}
                    {(eventtype === "soins" || eventtype === "balade") &&
                      (!isRecurring || updateScope !== "occurrence") && (
                        <Field label="Répétition">
                          <Select
                            value={recurrenceValue}
                            onValueChange={(value) =>
                              setValues((previous) => ({
                                ...previous,
                                frequencevalue:
                                  value === "none" ? undefined : value,
                                frequencetype:
                                  value === "none" ? undefined : "recurring",
                              }))
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {!isRecurring && (
                                <SelectItem value="none">
                                  Ne pas répéter
                                </SelectItem>
                              )}
                              <SelectItem value="daily">
                                Tous les jours
                              </SelectItem>
                              <SelectItem value="weekly">
                                Toutes les semaines
                              </SelectItem>
                              <SelectItem value="biweekly">
                                Toutes les deux semaines
                              </SelectItem>
                              <SelectItem value="monthly">
                                Tous les mois
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                  </div>
                </FormSection>
                {(eventtype === "soins" || eventtype === "rdv") && (
                  <label className="flex min-h-11 items-center gap-3 rounded-control border bg-card px-3 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={values.todisplay ?? true}
                      onChange={(changeEvent) =>
                        setValues((previous) => ({
                          ...previous,
                          todisplay: changeEvent.target.checked,
                        }))
                      }
                    />
                    Afficher dans le dossier médical
                  </label>
                )}
                <FormSection title="Commentaire">
                  <Textarea
                    name="commentaire"
                    value={values.commentaire || ""}
                    onChange={handleTextareaChange}
                    rows={5}
                    placeholder="Informations utiles, consignes, préparation…"
                  />
                </FormSection>
              </div>
            ),
          },
          {
            title: "Finaliser",
            description:
              "Ajoutez les documents utiles puis vérifiez votre événement.",
            icon: CheckCircle2,
            content: (
              <div className="space-y-4">
                {(eventtype === "soins" || eventtype === "rdv") && (
                  <FormSection
                    title="Documents médicaux"
                    description="PDF, JPEG ou PNG · 3 fichiers maximum · 3 Mo par fichier."
                  >
                    {!isPremium ? (
                      <PremiumNotice feature="medicalDocuments" compact />
                    ) : (
                      <>
                        <Input
                          ref={inputRef}
                          type="file"
                          name="documents"
                          accept="application/pdf,image/jpeg,image/png"
                          multiple
                          onChange={handleFileChange}
                          disabled={filesLeft <= 0}
                        />
                        {allFiles.length > 0 && (
                          <ul className="mt-3 divide-y rounded-control border">
                            {allFiles.map((file, index) => (
                              <li
                                key={`${file.name}-${index}`}
                                className="flex items-center gap-3 px-3 py-2 text-sm"
                              >
                                <FileText
                                  className="size-4 shrink-0 text-primary"
                                  aria-hidden="true"
                                />
                                <span className="min-w-0 flex-1 truncate">
                                  {file.name.split("/").pop()}
                                </span>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    file.fromS3
                                      ? setFilePendingRemoval(file.name)
                                      : setSelectedFiles((previous) =>
                                          previous.filter(
                                            (_, candidateIndex) =>
                                              candidateIndex !==
                                              index - visibleLinkedFiles.length,
                                          ),
                                        )
                                  }
                                >
                                  Retirer
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </FormSection>
                )}
                <FormSection title="Résumé">
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Événement</dt>
                      <dd className="mt-1 font-semibold">
                        {values.nom || "Sans nom"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Type</dt>
                      <dd className="mt-1 font-semibold">{eventTitle}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Date</dt>
                      <dd className="mt-1 font-semibold">
                        {values.dateevent || "Non renseignée"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Animaux</dt>
                      <dd className="mt-1 font-semibold">
                        {values.animaux?.length || 0} sélectionné(s)
                      </dd>
                    </div>
                  </dl>
                </FormSection>
              </div>
            ),
          },
        ]}
      />
      <ConfirmDialog
        open={Boolean(filePendingRemoval)}
        title="Retirer ce document médical ?"
        description="Le document sera supprimé définitivement lors de l’enregistrement."
        confirmLabel="Retirer"
        onCancel={() => setFilePendingRemoval(undefined)}
        onConfirm={() => {
          if (filePendingRemoval)
            setRemovedLinkedFiles((previous) =>
              previous.includes(filePendingRemoval)
                ? previous
                : [...previous, filePendingRemoval],
            );
          setFilePendingRemoval(undefined);
        }}
      />
    </>
  );
};
