export type SousEtape = {
  id: string;
  etape: string;
  state: string;
  order: number;
};

export type Objective = {
  id: string;
  animaux: number[];
  title: string;
  temporalityobjectif: string;
  datedebut: Date;
  datefin: Date;
  sousEtapes: SousEtape[]; // ou un type plus structuré si besoin
};