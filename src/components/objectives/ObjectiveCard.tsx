import { Objectifs } from "@/types/objectifs";

export const ObjectiveCard = ({ objective }: { objective: Objectifs }) => (
    <div className="text-sm">
        <div className="font-medium">○ {objective.title}</div>
        <div className="text-muted-foreground">{objective.datefin}</div>
    </div>
);
