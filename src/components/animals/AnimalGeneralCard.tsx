import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, Button } from "@/components/ui";
import { MoreVertical } from "lucide-react";
import { Animal } from "@/types/animal";
import { Skeleton } from "../ui/skeleton";

interface AnimalGeneralCardProps {
  animal?: Animal | null;
  isLoading: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function AnimalGeneralCard({ animal, isLoading, onEdit, onDelete }: AnimalGeneralCardProps) {
  return (
    <div className="bg-card rounded-xl shadow-sm dark:shadow-lg dark:shadow-black/30 p-6 flex flex-col gap-2 relative">
      <h2 className="text-lg font-bold mb-2">Informations générales</h2>
      {animal?.provenance === "owner" && (
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Options animal">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>Modifier</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      {isLoading || !animal ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <>
            <div><strong>Nom :</strong> {animal.nom}</div>
            <div><strong>Espèce :</strong> {animal.espece}</div>
            <div><strong>Date de naissance :</strong> {animal.datenaissance ?? ""}</div>
            <div><strong>Race :</strong> {animal.race ?? ""}</div>
            <div><strong>Date d'arrivée :</strong> {animal.datearrivee ?? ""}</div>
            <div><strong>Date de départ :</strong> {animal.datedepart ?? ""}</div>
            <div><strong>Informations supplémentaires :</strong> {animal.informations ?? ""}</div>
            <div><strong>Nom de la mère :</strong> {animal.nommere ?? ""}</div>
            <div><strong>Nom du père :</strong> {animal.nompere ?? ""}</div>
            <div><strong>Numéro d'identification :</strong> {animal.numeroidentification ?? ""}</div>
            <div><strong>Robe :</strong> {animal.robe ?? ""}</div>
            <div><strong>Sexe :</strong> {animal.sexe ?? ""}</div>
            {animal.datedeces && <div><strong>Date de décès :</strong> {animal.datedeces}</div>}
        </>
      )}
    </div>
  );
}