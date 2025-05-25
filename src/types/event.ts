export type Event = {
    // Obligatoires
    id: string;
    nom: string;
    dateevent: string;
    animaux: string[];
    eventtype: string;

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
  };
  