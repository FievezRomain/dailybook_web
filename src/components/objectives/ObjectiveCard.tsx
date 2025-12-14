import { Objective } from "@/types/objective";
import { MoreVertical } from "lucide-react";
import { CustomCheckbox } from "../ui/CustomCheckbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Animal } from "@/types/animal";
import { AnimalAvatar } from "../animals/AnimalAvatar";
import { Skeleton } from "../ui/skeleton";
import { ImageSigned } from "@/types/image";
import { Progress } from "@/components/ui/progress";

// Typage des props pour la card d'objectif
type ObjectiveCardProps = {
    objective: Objective;
    animals: Animal[] | undefined;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onComplete: (objectiveId: number, etapeId: number, objective: Objective) => void;
    onUpdateAnimalImage: (id: number, imageObj: ImageSigned) => void;
};

// Exemple d'utilisation dans le composant principal
export function ObjectiveCard({
    objective,
    animals,
    onEdit,
    onDelete,
    onComplete,
    onUpdateAnimalImage,
}: ObjectiveCardProps) {
    // Calcul de la progression
    const totalEtapes = objective.sousetapes.length;
    const doneEtapes = objective.sousetapes.filter(e => e.state === true).length;
    const progressValue = totalEtapes === 0 ? 0 : Math.round((doneEtapes / totalEtapes) * 100);

    return (
        <div className="bg-card rounded-xl shadow-sm p-5 border flex flex-col gap-2 relative">
            {/* Bouton d'options en haut à droite */}
            <div className="absolute top-3 right-3 z-10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="p-1">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(objective.id)}>Modifier</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(objective.id)}
                        >
                            Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="font-semibold text-lg">{objective.title}</div>
            {/* Date + photos animaux */}
            <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                <span>
                    Du {new Date(objective.datedebut).toLocaleDateString()} au {new Date(objective.datefin).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                    {animals === undefined
                        ? [...Array(objective.animaux.length)].map((_, i) => (
                            <Skeleton key={i} className="w-7 h-7 rounded-full" />
                        ))
                        : animals
                            .filter(animal => objective.animaux.includes(animal.id))
                            .map(animal => (
                                <AnimalAvatar
                                    key={animal.id}
                                    animal={animal}
                                    onUpdateAnimalImage={onUpdateAnimalImage}
                                    width={28}
                                    height={28}
                                    classNames="border-2 border-background rounded-full"
                                />
                            ))
                    }
                </div>
            </div>
            {/* Progress bar */}
            <div className="mt-2">
                <Progress value={progressValue} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                    {doneEtapes} / {totalEtapes} étapes terminées
                </div>
            </div>
            {/* Liste des étapes */}
            <div className="mt-3 flex flex-col gap-2">
                {objective.sousetapes
                    .sort((a, b) => a.order - b.order)
                    .filter(etape => typeof etape.id === "number" && etape.id !== undefined)
                    .map((etape) => (
                        <div key={etape.id} className="flex gap-2 w-full max-w-full">
                            <CustomCheckbox
                                checked={etape.state === true}
                                onChange={() => onComplete(objective.id, etape.id as number, objective)}
                            />
                            <span
                                className={`text-sm break-all whitespace-normal ${
                                    etape.state === true &&
                                        "text-muted-foreground"
                                } flex-1`}
                                style={{ wordBreak: "break-word" }}
                            >
                                {etape.etape}
                            </span>
                        </div>
                    ))}
            </div>
        </div>
    );
}