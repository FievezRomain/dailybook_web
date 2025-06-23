'use client';

import { getEvents } from "@/api/events";
import { Event } from "@/types/event";
import useSWR from "swr";
import styles from '@/styles/pages/dashboard.module.scss';

type Props = {
        prenom: string;
        initialEvents: Event[];
        token: string;
};


export default function ProfilContent({ initialEvents, token, prenom }: Props) {
        const { data: events = initialEvents, isLoading } = useSWR(['events', token], () => getEvents(token));

        return (
                <div className={styles.page_body}>
                        <div className={styles.page_container /*Partie gauche*/}>
                                <div className={styles.page_section}>
                                        <div className={styles.page_desc}>
                                                <h1>
                                                        Espace compte
                                                </h1>
                                                <div>

                                                </div>
                                        </div>

                                        {isLoading && <p>Chargement des événements...</p>}

                                </div>
                                <div className={styles.page_section /*Partie droite*/}>
                                        <div className={styles.settings_group}>
                                                <h2>Paramètres</h2>
                                                <div></div>
                                                <a>
                                                        <img src="/globe.svg"></img> Changer mon mot de passe
                                                </a>
                                                <a>
                                                        <img src="/globe.svg"></img> Changer mon nom
                                                </a>
                                        </div>
                                        <div className={styles.settings_group}>
                                                <h2>Informations</h2>
                                                <div></div>
                                                <a>
                                                        <img src="/globe.svg"></img> Gérer mon abonnement
                                                </a>
                                                <a>
                                                        <img src="/globe.svg"></img> Support utilisateur
                                                </a>
                                                <a>
                                                        <img src="/globe.svg"></img> Passer en mode sombre
                                                </a>
                                                <a>
                                                        <img src="/globe.svg"></img> Supprimer mon compte
                                                </a>
                                                <a>
                                                        <img src="/globe.svg"></img> Déconnexion
                                                </a>
                                        </div>

                                </div>
                        </div>
                </div>
        );
}
