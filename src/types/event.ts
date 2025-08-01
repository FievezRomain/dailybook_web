import { ComponentType } from "react";

export type Event = {
    // Obligatoires
    id: number;
    nom: string;
    dateevent: string;
    animaux: number[];
    eventtype: string;
    state: string;

    // Facultatifs
    heuredebutevent?: string;
    lieu?: string;
    specialiste?: string;
    depense?: string;
    categoriedepense?: string;
    notif?: string;
    optionnotif?: string;
    heuredebutbalade?: string;
    datefinbalade?: string;
    heurefinbalade?: string;
    discipline?: string;
    note?: string;
    epreuve?: string;
    dossart?: string;
    placement?: string;
    traitement?: string;
    datefinsoins?: string;
    commentaire?: string;
    frequencetype?: string;
    frequencevalue?: string;
    idparent?: string;
    documents?: string[];
    issharedevent?: string;
    color?: string;
    delay?: number;
    icon?: ComponentType;
    titleType?: string;
};

export type MappedEvent = Event & {
  icon: React.ComponentType;
  color: string;
  titleType: string;
  delay?: number;
};
  