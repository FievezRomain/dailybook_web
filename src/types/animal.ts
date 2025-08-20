import { ImageSigned } from "./image";

export type Animal = {
    id: number;
    nom: string;
    datenaissance: string;
    provenance: string;
    email: string;
    espece: string;

    race?: string;
    food?: string;
    poids?: string;
    sexe?: string;
    taille?: string;
    quantity?: string;
    unity?: string;
    robe?: string;
    nompere?: string;
    nommere?: string;
    numeroidentification?: string;
    datedeces?: string;
    image?: string;
    informations?: string;
    datearrivee?: string;
    datedepart?: string;

    imageSigned?: ImageSigned;

}