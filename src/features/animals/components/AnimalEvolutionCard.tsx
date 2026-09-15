import { useMemo, useState } from "react";
import { Camera, Images, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getValidAnimalImage } from "@/features/animals/utils/animals";
import { ConfirmDialog } from "@/shared/components/feedback/ConfirmDialog";
import {
  PremiumNotice,
  usePremiumGate,
} from "@/shared/components/feedback/PremiumGate";
import { SignedImage } from "@/shared/components/feedback/SignedImage";
import { Card } from "@/shared/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useBodyPictures } from "@/features/animals/hooks/use-body-pictures";
import type { AnimalBodyPicture } from "../types/animal";

interface AnimalEvolutionCardProps {
  idAnimal?: number;
  isPremium: boolean;
  canEdit: boolean;
}

export function AnimalEvolutionCard({
  idAnimal,
  isPremium,
  canEdit,
}: AnimalEvolutionCardProps) {
  const { handlePremiumError } = usePremiumGate();
  const {
    pictures,
    isLoading,
    error,
    addPicture,
    deletePicture,
    updatePictureUrl,
    refetch,
  } = useBodyPictures(idAnimal, isPremium);
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const value = new Date();
        value.setDate(1);
        value.setMonth(value.getMonth() - index);
        const key = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
        return {
          key,
          label: value.toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          }),
        };
      }),
    [],
  );
  const [selectedMonth, setSelectedMonth] = useState(months[0].key);
  const [isUploading, setIsUploading] = useState(false);
  const [pictureToDelete, setPictureToDelete] =
    useState<AnimalBodyPicture | null>(null);
  const orderedPictures = [...pictures].sort((left, right) =>
    (right.date_enregistrement ?? "").localeCompare(
      left.date_enregistrement ?? "",
    ),
  );
  const hasPictureForMonth = pictures.some(
    (picture) => picture.date_enregistrement?.slice(0, 7) === selectedMonth,
  );

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Le fichier doit être une image.");
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error("L’image ne doit pas dépasser 1 Mo.");
      return;
    }
    setIsUploading(true);
    try {
      await addPicture({ file, date: `${selectedMonth}-01` });
      toast.success("Photo ajoutée au suivi.");
    } catch (uploadError) {
      if (!(await handlePremiumError(uploadError, "bodyTracking")))
        toast.error("Impossible d’ajouter cette photo.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function confirmDelete() {
    if (!pictureToDelete) return;
    try {
      await deletePicture(pictureToDelete);
      toast.success("Photo supprimée.");
      setPictureToDelete(null);
    } catch (deleteError) {
      if (!(await handlePremiumError(deleteError, "bodyTracking")))
        toast.error("Impossible de supprimer cette photo.");
    }
  }

  return (
    <Card className="h-full gap-0 overflow-hidden rounded-[24px] p-0 shadow-surface">
      <header className="border-b bg-muted/20 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-[14px] bg-primary/10 text-primary">
            <Images className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
              Souvenirs
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">
              Évolution physique
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Un repère photo par mois pour voir les changements.
            </p>
          </div>
        </div>
      </header>
      <div className="p-5">
        {!isPremium ? (
          <PremiumNotice feature="bodyTracking" />
        ) : (
          canEdit && (
            <div className="mb-5 rounded-[18px] bg-muted/45 p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr] sm:items-end">
                <label
                  className="grid gap-1.5 text-xs font-medium"
                  htmlFor={`body-month-${idAnimal}`}
                >
                  Mois du suivi
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger
                      id={`body-month-${idAnimal}`}
                      className="w-full capitalize"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem
                          key={month.key}
                          value={month.key}
                          disabled={pictures.some(
                            (picture) =>
                              picture.date_enregistrement?.slice(0, 7) ===
                              month.key,
                          )}
                        >
                          <span className="capitalize">{month.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                {!hasPictureForMonth ? (
                  <label
                    className="grid gap-1.5 text-xs font-medium"
                    htmlFor={`body-file-${idAnimal}`}
                  >
                    Ajouter une photo
                    <Input
                      id={`body-file-${idAnimal}`}
                      type="file"
                      name="image"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      disabled={isUploading}
                      className="cursor-pointer bg-card"
                    />
                  </label>
                ) : (
                  <p className="rounded-control bg-card px-3 py-2.5 text-xs text-muted-foreground">
                    Une photo existe déjà pour ce mois.
                  </p>
                )}
              </div>
            </div>
          )
        )}
        {isLoading || isUploading ? (
          <Skeleton className="h-72 w-full rounded-[18px]" />
        ) : error ? (
          <div
            role="alert"
            className="rounded-[18px] bg-destructive/10 p-4 text-sm text-destructive"
          >
            Impossible de charger le suivi visuel.{" "}
            <button
              type="button"
              className="font-semibold underline"
              onClick={() => void refetch()}
            >
              Réessayer
            </button>
          </div>
        ) : orderedPictures.length ? (
          <Carousel className="mx-auto w-full max-w-xl">
            <CarouselContent>
              {orderedPictures.map((photo, index) => (
                <CarouselItem key={photo.id}>
                  <figure className="relative overflow-hidden rounded-[20px] bg-muted/50">
                    <div className="grid min-h-72 place-items-center p-4">
                      <SignedImage
                        imageSigned={photo.imageSigned}
                        alt={photo.filename || `Photo ${index + 1}`}
                        classNames="max-h-80 w-auto rounded-[16px] object-contain"
                        width={520}
                        height={340}
                        onErrorRefresh={() => {
                          if (idAnimal)
                            getValidAnimalImage(
                              photo.imageSigned,
                              photo.filename,
                              idAnimal,
                              "body",
                              undefined,
                              (_animalId, pictureId, image) =>
                                updatePictureUrl(pictureId, image),
                              photo.id,
                            );
                        }}
                      />
                    </div>
                    {canEdit && (
                      <button
                        type="button"
                        className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-background/90 text-destructive shadow-surface backdrop-blur hover:bg-background"
                        onClick={() => setPictureToDelete(photo)}
                        aria-label="Supprimer cette photo"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    )}
                    <figcaption className="border-t bg-card/90 px-4 py-3 text-center text-xs text-muted-foreground">
                      {photo.date_enregistrement
                        ? new Date(
                            `${photo.date_enregistrement}T12:00:00`,
                          ).toLocaleDateString("fr-FR", {
                            month: "long",
                            year: "numeric",
                          })
                        : "Date inconnue"}
                    </figcaption>
                  </figure>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-3" />
            <CarouselNext className="right-3" />
          </Carousel>
        ) : (
          <div className="grid min-h-64 place-items-center rounded-[20px] border border-dashed text-center">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <Camera className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-semibold">
                Aucune photo de suivi
              </p>
              <p className="mt-1 max-w-56 text-xs leading-5 text-muted-foreground">
                Ajoutez une photo mensuelle pour construire une évolution
                visuelle.
              </p>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={pictureToDelete !== null}
        title="Supprimer cette photo de suivi ?"
        description="La photo sera supprimée définitivement du suivi corporel."
        confirmLabel="Supprimer"
        onCancel={() => setPictureToDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </Card>
  );
}
