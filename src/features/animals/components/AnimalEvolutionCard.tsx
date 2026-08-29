import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/shared/components/ui/carousel";
import { SignedImage } from "@/shared/components/feedback/SignedImage";
import { getValidAnimalImage } from "@/features/animals/utils/animals";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import { useBodyPictures } from "@/features/animals/hooks/use-body-pictures";
import { X } from "lucide-react";
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog';
import type { AnimalBodyPicture } from '../types/animal';
import { PremiumNotice, usePremiumGate } from '@/shared/components/feedback/PremiumGate';


interface AnimalEvolutionCardProps {
  idAnimal?: number;
  isPremium: boolean;
  canEdit: boolean;
}

export function AnimalEvolutionCard({ idAnimal, isPremium, canEdit }: AnimalEvolutionCardProps) {
  const { handlePremiumError } = usePremiumGate();
  const { pictures: bodyPics, isLoading, error, addPicture, deletePicture, updatePictureUrl, refetch } =
    useBodyPictures(idAnimal, isPremium);

  const trackingMonths = useMemo(() => Array.from({ length: 12 }, (_, index) => {
    const value = new Date();
    value.setDate(1);
    value.setMonth(value.getMonth() - index);
    const key = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
    return { key, date: `${key}-01`, label: value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) };
  }), []);
  const [selectedMonth, setSelectedMonth] = useState(trackingMonths[0].key);
  const [pictureToDelete, setPictureToDelete] = useState<AnimalBodyPicture | null>(null);

  // Vérifie si une photo a déjà été ajoutée ce mois-ci
  const hasPhotoThisMonth = useMemo(() => {
    return bodyPics.some(pic => {
      if (!pic.date_enregistrement) return false;
      return pic.date_enregistrement.slice(0, 7) === selectedMonth;
    });
  }, [bodyPics, selectedMonth]);

  const [isUploading, setIsUploading] = useState(false);

  // State pour stocker les tailles des images
  const [imageSizes, setImageSizes] = useState<{ [id: number]: { width: number; height: number } }>({});

  useEffect(() => {
    bodyPics.forEach((photo) => {
      if (photo.imageSigned?.url) {
        const img = new window.Image();
        img.src = photo.imageSigned.url;
        img.onload = () => {
          setImageSizes((prev) => ({
            ...prev,
            [photo.id]: { width: img.naturalWidth, height: img.naturalHeight }
          }));
        };
      }
    });
  }, [bodyPics]);

  // Gestion du changement de fichier image
	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Le fichier doit être une image.");
			return;
		}
		if (file.size > 1024 * 1024) {
			toast.error("L'image ne doit pas dépasser 1 Mo.");
			return;
		}

		setIsUploading(true);
		try {
			await addPicture({ file, date: `${selectedMonth}-01` });

			toast.success("Image envoyée avec succès !");
		} catch (error) {
			if (!await handlePremiumError(error, 'bodyTracking')) toast.error("Erreur lors de l’upload de l’image.");
		} finally {
			setIsUploading(false);
		}
	};

  const handleDeleteImage = async (picture: (typeof bodyPics)[number]) => {
    try {
      await deletePicture(picture);
      toast.success("Photo supprimée !");
      setPictureToDelete(null);
    } catch (error) {
      if (!await handlePremiumError(error, 'bodyTracking')) toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="bg-card flex flex-col gap-2 rounded-xl shadow-sm dark:shadow-lg dark:shadow-black/30 p-6 flex-1 min-h-0">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">Évolution physique</h2>
        {!isPremium && <PremiumNotice feature="bodyTracking" compact className="max-w-xl" />}
        {isPremium && canEdit && !isUploading && (
          <div className="flex flex-wrap items-end gap-2">
            <label className="grid gap-1 text-xs" htmlFor={`body-month-${idAnimal}`}>Mois du suivi
              <select id={`body-month-${idAnimal}`} className="h-9 rounded-md border bg-background px-3 text-sm capitalize"
                value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
                {trackingMonths.map((month) => <option key={month.key} value={month.key} disabled={bodyPics.some((picture) => picture.date_enregistrement?.slice(0, 7) === month.key)}>{month.label}</option>)}
              </select>
            </label>
            {!hasPhotoThisMonth ? <label className="grid gap-1 text-xs" htmlFor={`body-file-${idAnimal}`}>Photo JPEG, PNG ou WebP · 1 Mo maximum
              <Input id={`body-file-${idAnimal}`} type="file" name="image" accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange} className="w-86 cursor-pointer" />
            </label> : <span className="text-xs text-muted-foreground">Une photo existe déjà pour ce mois.</span>}
          </div>
        )}
        {isPremium && isUploading && (
          <span className="text-xs text-muted-foreground flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full inline-block" />
            Upload en cours...
          </span>
        )}
      </div>
      {isLoading ? (
        <Skeleton className="w-full h-48 rounded-xl" />
      ) : error ? (
        <div role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          Impossible de charger le suivi visuel. <button type="button" className="underline" onClick={() => void refetch()}>Réessayer</button>
        </div>
      ) : bodyPics.length > 0 ? (
        <div className="w-full h-full flex justify-center items-center relative">
          <div className="w-full max-w-lg 2xl:max-w-3xl mx-auto flex items-center justify-center relative" style={{ minHeight: 300 }}>
            <Carousel>
              <CarouselContent>
                {[...bodyPics].sort((left, right) => (right.date_enregistrement ?? '').localeCompare(left.date_enregistrement ?? '')).map((photo, idx) => {
                  const size = imageSizes[photo.id];
                  return (
                    <CarouselItem key={idx} className="flex flex-col items-center justify-center h-full relative">
                      {/* Croix de suppression */}
                      {canEdit && <button
                        type="button"
                        className="absolute top-2 right-2 z-20 bg-black/60 hover:bg-black/80 rounded-full p-1"
                        onClick={() => setPictureToDelete(photo)}
                        title="Supprimer cette photo"
                      >
                        <X size={20} className="text-white" />
                      </button>}
                      <SignedImage
                        imageSigned={photo.imageSigned}
                        alt={photo.filename || `Photo ${idx + 1}`}
                        classNames="rounded-xl transition-transform duration-300 hover:scale-105 mx-auto"
                        width={size?.width || 100}
                        height={size?.height || 200}
                        onErrorRefresh={() => {
                          if (idAnimal) {
                            getValidAnimalImage(
                              photo.imageSigned, photo.filename, idAnimal, 'body', undefined,
                              (_animalId, pictureId, image) => updatePictureUrl(pictureId, image), photo.id,
                            );
                          }
                        }}
                      />
                      <div className="mt-2 text-sm text-muted-foreground text-center">
                        {photo.date_enregistrement && <span>{new Date(photo.date_enregistrement).toLocaleDateString()}</span>}
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              {/* Flèches positionnées en absolute */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                <CarouselPrevious />
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                <CarouselNext />
              </div>
            </Carousel>
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground text-sm">Aucune photo physique disponible.</div>
      )}
      <ConfirmDialog open={pictureToDelete !== null} title="Supprimer cette photo de suivi ?"
        description="La photo sera supprimée définitivement du suivi corporel."
        confirmLabel="Supprimer" onCancel={() => setPictureToDelete(null)}
        onConfirm={() => pictureToDelete && void handleDeleteImage(pictureToDelete)} />
    </div>
  );
}
