export type SousEtape = {
  id: number | undefined;
  etape: string;
  state: boolean;
  order: number;
};

export type Objective = {
  id: number;
  animaux: number[];
  title: string;
  temporalityobjectif: string;
  datedebut: string;
  datefin: string;
  sousetapes: SousEtape[];
};