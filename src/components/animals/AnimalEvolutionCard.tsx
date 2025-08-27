import { useMemo } from "react";
import { Skeleton } from "../ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { AnimalBodyPicture } from "@/types/animal";
import Image from "next/image";
import { SignedImage } from "../ui/SignedImage";
import { getValidAnimalImage } from "@/utils/animalsUtils";
import { ImageSigned } from "@/types/image";

interface AnimalEvolutionCardProps {
  idAnimal: number;
  isLoading: boolean;
  bodyPics: AnimalBodyPicture[];
  isPremium: boolean;
  onAddPhoto: () => void;
  onUpdateBodyPictureImage: (animalId: number, bodyPictureId: number, imageObj: ImageSigned) => void;
}

export function AnimalEvolutionCard({ idAnimal, isLoading, bodyPics, isPremium, onAddPhoto, onUpdateBodyPictureImage }: AnimalEvolutionCardProps) {
  // Vérifie si une photo a déjà été ajoutée ce mois-ci
  const hasPhotoThisMonth = useMemo(() => {
    const now = new Date();
    return bodyPics.some(pic => {
      const picDate = new Date(pic.date_enregistrement);
      return picDate.getFullYear() === now.getFullYear() && picDate.getMonth() === now.getMonth();
    });
  }, [bodyPics]);

  return (
    <div className="bg-card flex flex-col gap-2 rounded-xl shadow-sm dark:shadow-lg dark:shadow-black/30 p-6 flex-1 min-h-0">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">Évolution physique</h2>
        {!isPremium && (
          <span className="text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-300 font-semibold">
            Premium requis
          </span>
        )}
        {isPremium && !hasPhotoThisMonth && (
          <button
            className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition"
            onClick={onAddPhoto}
          >
            Ajouter une photo du mois
          </button>
        )}
        {isPremium && hasPhotoThisMonth && (
          <span className="text-xs text-muted-foreground">Photo du mois déjà ajoutée</span>
        )}
      </div>
      {isLoading ? (
        <Skeleton className="w-full h-48 rounded-xl" />
      ) : bodyPics.length > 0 ? (
        <div className="w-full max-w-xl mx-auto">
          <Carousel>
            <CarouselContent>
              {bodyPics.map((photo, idx) => (
                <CarouselItem key={idx} className="flex flex-col items-center justify-center">
                  <SignedImage
                    imageSigned={photo.imageSigned}
                    alt={photo.filename || `Photo ${idx + 1}`}
                    classNames="rounded-xl object-cover w-full h-48 transition-transform duration-300 hover:scale-105"
                    width={384}
                    height={192}
                    onErrorRefresh={() => 
                        {
                            getValidAnimalImage(photo.imageSigned, photo.filename, idAnimal, 'animal_body', undefined, onUpdateBodyPictureImage, photo.id);
                        }}
                  />
                  <div className="mt-2 text-sm text-muted-foreground">
                    {photo.date_enregistrement && <span>{photo.date_enregistrement}</span>}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      ) : (
        <div className="text-muted-foreground text-sm">Aucune photo physique disponible.</div>
      )}
    </div>
  );
}