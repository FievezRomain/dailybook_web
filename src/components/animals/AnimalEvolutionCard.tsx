import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { AnimalBodyPicture } from "@/types/animal";
import { SignedImage } from "../ui/SignedImage";
import { getValidAnimalImage } from "@/utils/animalsUtils";
import { ImageSigned } from "@/types/image";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { deleteFromStorage, getPresignedUrl, uploadToStorage } from "@/services/storage";
import { useAnimals } from "@/context/AnimalContext";
import { X } from "lucide-react";


interface AnimalEvolutionCardProps {
  idAnimal: number;
  isLoading: boolean;
  bodyPics: AnimalBodyPicture[];
  isPremium: boolean;
  onChange: () => void;
  onUpdateUrlBodyPictureImage: (animalId: number, bodyPictureId: number, imageObj: ImageSigned) => void;
}

export function AnimalEvolutionCard({ idAnimal, isLoading, bodyPics, isPremium, onChange, onUpdateUrlBodyPictureImage }: AnimalEvolutionCardProps) {
  const { addBodyPicturesAnimal, deleteBodyPicturesAnimal } = useAnimals();

  // Vérifie si une photo a déjà été ajoutée ce mois-ci
  const hasPhotoThisMonth = useMemo(() => {
    const now = new Date();
    return bodyPics.some(pic => {
      const picDate = new Date(pic.date_enregistrement);
      return picDate.getFullYear() === now.getFullYear() && picDate.getMonth() === now.getMonth();
    });
  }, [bodyPics]);

  const [isUploading, setIsUploading] = useState(false);

  // State pour stocker les tailles des images
  const [imageSizes, setImageSizes] = useState<{ [id: number]: { width: number; height: number } }>({});

  useEffect(() => {
    // Reset sizes à chaque changement de bodyPics
    setImageSizes({});
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
		if (file.size > 3 * 1024 * 1024) {
			toast.error("L'image ne doit pas dépasser 3 Mo.");
			return;
		}

		setIsUploading(true);
		try {
			// 1. Demande une presigned URL à l’API
			const presignedUrl = await getPresignedUrl(file.name, file.type, "animal_body");
			// 2. Upload sur S3
			await uploadToStorage(file, presignedUrl);
      // 3. Ajoute la photo dans la BDD
      await addBodyPicturesAnimal(idAnimal, file.name);

			toast.success("Image envoyée avec succès !");
			// 3. Callback pour informer le parent (ex : re-fetch)
			onChange();
		} catch (err: any) {
			toast.error("Erreur lors de l’upload de l’image.");
		} finally {
			setIsUploading(false);
		}
	};

  const handleDeleteImage = async (bodyPictureId: number, filename: string) => {
    try {
      // 1. Supprime la photo dans la BDD
      await deleteBodyPicturesAnimal(bodyPictureId);
      // 2. Supprime la photo dans S3
      await deleteFromStorage(filename, "body", idAnimal);

      toast.success("Photo supprimée !");
      onChange();
    } catch (err: any) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="bg-card flex flex-col gap-2 rounded-xl shadow-sm dark:shadow-lg dark:shadow-black/30 p-6 flex-1 min-h-0">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">Évolution physique</h2>
        {!isPremium && (
          <span className="text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-300 font-semibold">
            Premium requis
          </span>
        )}
        {isPremium && !hasPhotoThisMonth && !isUploading && (
          <Input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            max={1}
            className="w-86 cursor-pointer"
          />
        )}
        {isPremium && isUploading && (
          <span className="text-xs text-muted-foreground flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full inline-block" />
            Upload en cours...
          </span>
        )}
        {isPremium && hasPhotoThisMonth && (
          <span className="text-xs text-muted-foreground">Photo du mois déjà ajoutée</span>
        )}
      </div>
      {isLoading ? (
        <Skeleton className="w-full h-48 rounded-xl" />
      ) : bodyPics.length > 0 ? (
        <div className="w-full h-full flex justify-center items-center relative">
          <div className="w-full max-w-lg 2xl:max-w-3xl mx-auto flex items-center justify-center relative" style={{ minHeight: 300 }}>
            <Carousel>
              <CarouselContent>
                {bodyPics.map((photo, idx) => {
                  const size = imageSizes[photo.id];
                  return (
                    <CarouselItem key={idx} className="flex flex-col items-center justify-center h-full relative">
                      {/* Croix de suppression */}
                      <button
                        type="button"
                        className="absolute top-2 right-2 z-20 bg-black/60 hover:bg-black/80 rounded-full p-1"
                        onClick={() => handleDeleteImage(photo.id, photo.filename)}
                        title="Supprimer cette photo"
                      >
                        <X size={20} className="text-white" />
                      </button>
                      <SignedImage
                        imageSigned={photo.imageSigned}
                        alt={photo.filename || `Photo ${idx + 1}`}
                        classNames="rounded-xl transition-transform duration-300 hover:scale-105 mx-auto"
                        width={size?.width || 100}
                        height={size?.height || 200}
                        onErrorRefresh={() => {
                          getValidAnimalImage(photo.imageSigned, photo.filename, idAnimal, 'animal_body', undefined, onUpdateUrlBodyPictureImage, photo.id);
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
    </div>
  );
}