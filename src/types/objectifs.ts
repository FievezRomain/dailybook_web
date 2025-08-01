type Etape = {
        id: number;
        etape: string;
        state: boolean;
        order: number;
}
export type Objectifs = {
        id: number;
        title: string;
        temporality: string;
        datedebut: string;
        datefin: string;
        sousEtapes: Etape[];
        is_shared_objectif?: string;
}