import { X, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MappedEvent } from "@/types/event";
import { Animal } from "@/types/animal";
import { Button } from "../ui";
import { Skeleton } from "../ui/skeleton";
import { getPresignedGetUrl } from "@/services/storage";
import { useState } from "react";
import { ImageSigned } from "@/types/image";
import { AnimalAvatar } from "../animals/AnimalAvatar";

type EventDrawerProps = {
  open: boolean;
  onClose: () => void;
  event: MappedEvent;
  animals: Animal[] | undefined; // undefined = en cours de chargement
  onDelete: () => void;
  onUpdateAnimalImage: (id: number, imageObj: ImageSigned) => void;
};

export const EventDrawer = ({ open, onClose, event, animals, onDelete, onUpdateAnimalImage }: EventDrawerProps) => {
    const Icon = event.icon;
    const [signedUrls, setSignedUrls] = useState<{ [fileName: string]: { url: string, expiresAt: number } }>({});

    const handleOpenFile = async (fileName: string) => {
        const cached = signedUrls[fileName];
        const now = Date.now();
        if (cached && cached.expiresAt > now) {
            window.open(cached.url, "_blank");
        } else {
            const url = await getPresignedGetUrl(fileName, "event", event.id);
            setSignedUrls(prev => ({
                ...prev,
                [fileName]: { url, expiresAt: now + 4.5 * 60 * 1000 }
            }));
            window.open(url, "_blank");
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
                        <Button onClick={onDelete} className="p-2 rounded hover:bg-red-600/20 text-red-100" variant={"ghost"}>
                            <Trash2 size={20} />
                        </Button>
                        <Button onClick={onClose} className="p-2 rounded hover:bg-white/20 text-white" variant={"ghost"}>
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
                            <InfoItem label="Fréquence" value={`${event.frequencetype} ${event.frequencevalue || ""}`} />
                        )}
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
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Commentaire */}
                        {event.commentaire && (
                        <div className="bg-muted/10 rounded-lg p-4 shadow-sm">
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
                        <div className="flex flex-wrap gap-2">
                            {event.documents.map((doc, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span>📄 {doc.name.split("/").pop()}</span>
                                    <Button
                                        className="text-text underline text-sm"
                                        onClick={async () => await handleOpenFile(doc.name)}
                                    >
                                        Visualiser
                                    </Button>
                                    <Button
                                        className="text-text underline text-sm"
                                        onClick={async () => await handleOpenFile(doc.name)}
                                    >
                                        Télécharger
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
