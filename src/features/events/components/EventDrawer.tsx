import { X, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import type { MappedEvent } from "@/features/events/types/event";
import type { Animal } from "@/features/animals/types/animal";
import { Button } from "@/shared/components/ui";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getEventDocumentUrl } from "@/features/events/api/events-api";
import { useState } from "react";
import type { ImageSigned } from "@/types/image";
import { AnimalAvatar } from "@/features/animals/components/AnimalAvatar";
import { openPresignedUrl } from '@/shared/security/presigned-url';

type EventDrawerProps = {
  open: boolean;
  onClose: () => void;
  event: MappedEvent;
  animals: Animal[] | undefined; // undefined = en cours de chargement
  onDelete: () => void;
  onUpdateAnimalImage: (id: number, imageObj: ImageSigned) => void;
};

function currentTimestamp() {
    return Date.now();
}

export const EventDrawer = ({ open, onClose, event, animals, onDelete, onUpdateAnimalImage }: EventDrawerProps) => {
    const Icon = event.icon;
    const [signedUrls, setSignedUrls] = useState<{ [fileName: string]: { url: string, expiresAt: number } }>({});
    const [documentError, setDocumentError] = useState<string>();

    const handleOpenFile = async (fileName: string) => {
        setDocumentError(undefined);
        try {
        const cached = signedUrls[fileName];
        const now = currentTimestamp();
        if (cached && cached.expiresAt > now) {
            openPresignedUrl(cached.url);
        } else {
            const url = await getEventDocumentUrl(event.id, fileName);
            setSignedUrls(prev => ({
                ...prev,
                [fileName]: { url, expiresAt: now + 4.5 * 60 * 1000 }
            }));
            openPresignedUrl(url);
        }
        } catch {
            setDocumentError("Impossible d’ouvrir ce document. Vérifiez votre accès puis réessayez.");
        }
    };
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent showCloseButton={false} className="max-w-[1200px] w-[90vw] h-[90vh] rounded-2xl shadow-3xl p-0 overflow-hidden flex flex-col">
                {/* HEADER */}
                <DialogHeader
                    className="flex items-center justify-between px-6 py-4 flex-row"
                    style={{
                        background: `linear-gradient(to right, rgba(var(${event.color}), 0.85), rgba(var(${event.color}), 0.95))`
                    }}
                >
                    <div className="flex items-center space-x-3 text-white">
                        <Icon />
                        <DialogTitle className="text-xl font-semibold">
                            {event.nom}
                        </DialogTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button onClick={onDelete} aria-label="Supprimer l’événement" className="p-2 rounded hover:bg-red-600/20 text-red-100" variant={"ghost"}>
                            <Trash2 size={20} />
                        </Button>
                        <Button onClick={onClose} aria-label="Fermer le détail" className="p-2 rounded hover:bg-white/20 text-white" variant={"ghost"}>
                            <X size={20} />
                        </Button>
                    </div>
                </DialogHeader>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Infos générales */}
                    <div className="bg-card rounded-lg p-4 space-y-3 shadow-sm">
                        <h3 className="text-base font-semibold mb-2">Informations générales</h3>
                        <InfoItem label="Type" value={event.eventtype} />
                        <InfoItem label="Date" value={event.dateevent} />
                        {event.heuredebutevent && <InfoItem label="Heure début" value={event.heuredebutevent} />}
                        {event.lieu && <InfoItem label="Lieu" value={event.lieu} />}
                        {event.specialiste && <InfoItem label="Spécialiste" value={event.specialiste} />}
                        {event.depense && <InfoItem label="Dépense" value={`${event.depense} €`} />}
                        {event.categoriedepense && <InfoItem label="Catégorie" value={event.categoriedepense} />}
                        {event.frequencetype && (
                            <InfoItem label="Répétition" value={formatRecurrence(event.frequencevalue)} />
                        )}
                        {event.shared_groups.length > 0 && <InfoItem label="Partagé avec" value={event.shared_groups.map((group) => group.name || `Groupe ${group.id}`).join(', ')} />}
                    </div>

                    {/* Colonne droite */}
                    <div className="space-y-4">
                        {/* Animaux */}
                        <div className="bg-card rounded-lg p-4 shadow-sm">
                            <h3 className="text-base font-semibold mb-2">Animaux</h3>
                            <div className="flex -space-x-2">
                                {animals === undefined ? (
                                    [...Array(event.animaux.length)].map((_, i) => (
                                        <Skeleton key={i} className="w-9 h-9 rounded-full" />
                                    ))
                                ) : (
                                    animals.map((animal) => (
                                        <AnimalAvatar
                                            key={animal.id}
                                            animal={animal}
                                            onUpdateAnimalImage={onUpdateAnimalImage}
                                            width={40}
                                            height={40}
                                            classNames="border-2 border-background rounded-full"
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Commentaire */}
                        {event.commentaire && (
                        <div className="bg-card rounded-lg p-4 shadow-sm">
                            <h3 className="text-base font-semibold mb-2">Commentaire</h3>
                            <p className="text-sm text-muted-foreground">{event.commentaire}</p>
                        </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                {event.documents && event.documents.length > 0 && (
                    <div className="bg-muted/20 px-6 py-4 border-t flex flex-col">
                        <p className="text-sm font-medium mb-2">Documents</p>
                        {documentError ? <p role="alert" className="mb-2 text-sm text-destructive">{documentError}</p> : null}
                        <div className="flex flex-wrap gap-2">
                            {event.documents.map((doc, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span>📄 {doc.name.split("/").pop()}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => await handleOpenFile(doc.name)}
                                    >
                                        Ouvrir le document
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

// Composant pour afficher une ligne info
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm font-medium">{label}</p>
    <p className="text-sm text-muted-foreground">{value}</p>
  </div>
);

function formatRecurrence(value?: string) {
  return ({
    daily: 'Tous les jours', tlj: 'Tous les jours', weekly: 'Toutes les semaines', tls: 'Toutes les semaines',
    biweekly: 'Toutes les deux semaines', tl2s: 'Toutes les deux semaines', monthly: 'Tous les mois', tlm: 'Tous les mois',
  } as Record<string, string>)[value ?? ''] ?? 'Série récurrente';
}
