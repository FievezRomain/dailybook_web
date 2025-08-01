import { Objectifs } from "@/types/objectifs";
import { ObjectiveCard } from "./ObjectiveCard";

export const ObjectiveList = ({ objectives }: { objectives: Objectifs[] }) => {
  if (objectives.length === 0) {
    return <p className="text-muted-foreground">Aucun objectif en cours</p>;
  }

  return (
    <div>
      {objectives.map((objective) => (
        <ObjectiveCard key={objective.id} objective={objective} />
      ))}
    </div>
  );
};
