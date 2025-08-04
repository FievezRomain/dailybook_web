import { X, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { MappedEvent } from "@/types/event";
import { Animal } from "@/types/animal";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui";

type EventDrawerProps = {
  open: boolean;
  onClose: () => void;
  event: MappedEvent; // ton type enrichi
  animals: Animal[] | undefined;
  onDelete: () => void;
};

export const EventDrawer = ({ open, onClose, event, animals, onDelete }: EventDrawerProps) => {
  const Icon = event.icon;

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
                                {animals?.map((animal) =>
                                    animal.image ? 
                                    (
                                        <Image
                                            key={animal.id}
                                            src={animal.image}
                                            alt={animal.nom}
                                            width={40}
                                            height={40}
                                            className="rounded-full border-2 border-background"
                                        />
                                    ) 
                                    : 
                                    (
                                        <div
                                            key={animal.id}
                                            className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-semibold uppercase"
                                        >
                                            {animal.nom.charAt(0)}
                                        </div>
                                    )
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
                                <Button
                                    key={index}
                                    className="text-primary underline hover:text-primary/80 text-sm"
                                    onClick={() => window.open(doc, "_blank")}
                                >
                                    📄 {doc.split("/").pop()}
                                </Button>
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
