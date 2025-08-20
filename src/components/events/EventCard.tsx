import { Animal } from "@/types/animal";
import { MappedEvent } from "@/types/event";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui";
import { MoreVertical } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { CustomCheckbox } from "../ui/CustomCheckbox";
import { useState } from "react";
import { ImageSigned } from "@/types/image";
import { AnimalAvatar } from "../animals/AnimalAvatar";

interface EventCardProps {
    event: MappedEvent;
    animals: Animal[] | undefined; // undefined = en cours de chargement
    onEdit: () => void;
    onDelete: () => void;
    onComplete: () => void;
    onOpenDrawer: (event:MappedEvent) => void;
    onDuplicate: () => void;
    onUpdateAnimalImage: (id: number, imageObj: ImageSigned) => void;
}

export const EventCard = ({ event, animals, onEdit, onDelete, onComplete, onOpenDrawer, onDuplicate, onUpdateAnimalImage }: EventCardProps) => {
    const [completed, setCompleted] = useState<boolean>(event.state === "Terminé");

    const handleComplete = () => {
        const newStatus = !completed;
        setCompleted(newStatus);
        onComplete();
    };

    const Icon = event.icon;
    
    return (
        <Card
            className="flex flex-col rounded-lg overflow-hidden border shadow-sm py-0 transition-transform hover:scale-[1.01] hover:shadow-md dark:hover:shadow-black/50"
            aria-label={`Carte d'événement ${event.nom}`}
        >
            {/* Header */}
            <CardHeader className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: `rgba(var(${event.color}),0.75)` }}>
                <div className="flex items-center space-x-2">
                    <Icon />
                    <span className="text-sm font-medium">{event.titleType}</span>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                            aria-label={`Menu d'options pour l'événement ${event.nom}`}
                            onClick={() => onEdit()}
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>
                            Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDuplicate}>
                            Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={onDelete}
                        >
                            Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            
            {/* Body */}
            <CardContent className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => onOpenDrawer(event)}>
                <CustomCheckbox 
                    checked={completed} 
                    onChange={(e) => {
                        e.stopPropagation(); // évite d'ouvrir le drawer quand on clique sur la checkbox
                        handleComplete();
                    }} 
                />
                <span className="text-base font-semibold flex-1 mx-3">{event.nom}</span>
        
                {/* Images des animaux liés */}
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
                                width={36}
                                height={36}
                                classNames="border-2 border-background rounded-full"
                            />
                        ))
                    )}
                </div>
            </CardContent>

            {/* Footer */}
            {event.delay !== undefined && (
                <CardFooter
                    className="bg-muted text-xs text-center px-3 py-1 rounded-full self-end mb-2 mr-2"
                    aria-label={`Cet événement a ${event.delay} jour(s) de retard`}
                >
                    {event.delay} jour(s) de retard
                </CardFooter>
            )}
        </Card>
    )
};
{/* <div className="text-sm">
        <div className="font-medium">○ {event.nom}</div>
        <div className="text-muted-foreground">{event.dateevent}</div>
    </div> */}