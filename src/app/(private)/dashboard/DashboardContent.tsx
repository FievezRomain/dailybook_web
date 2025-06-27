'use client';

import { getEvents } from "@/api/events";
import { Event } from "@/types/event";
import { getObjectifs } from "@/api/objectifs";
import { Objectifs } from "@/types/objectifs";
import useSWR from "swr";
import styles from '@/styles/components/dashboard.module.scss';

type Props = {
        prenom: string;
        initialEvents: Event[];
        initialObjectifs: Objectifs[];
        token: string;
};

const today = new Date();
today.setHours(0, 0, 0, 0);
let count_today = 0;
let count_later = 0;
let count_late = 0;

export default function DashboardContent({ initialEvents, initialObjectifs, token, prenom }: Props) {
        const { data: events = initialEvents, isLoading: isLoadingEvents } = useSWR(['events', token], () => getEvents(token));
        const { data: objectifs = initialObjectifs, isLoading: isLoadingObjectifs } = useSWR(['objectifs', token], () => getObjectifs(token));
        return (
                <div className={styles.page_body}>
                        <div className={styles.page_container}>
                                <div className={styles.page_section /*Partie gauche*/}>
                                        <div className={styles.dashboard_desc}>
                                                <div>
                                                        <h1>
                                                                Bienvenue, {prenom} !
                                                        </h1>
                                                        <h2>
                                                                {today.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </h2>
                                                </div>
                                                <span>
                                                        <img src="/globe.svg"></img>
                                                        <p>Tâches</p>
                                                </span>
                                        </div>
                                        {isLoadingEvents && <p>Chargement des événements...</p>}
                                        {isLoadingObjectifs && <p>Chargement des objectifs...</p>}
                                        <div className={styles.tab_medium}>
                                                <div className={styles.tab_header}>
                                                        <span></span>
                                                        <p>Aujourd'hui</p>
                                                        <span></span>
                                                </div>
                                                <div className={styles.tab_content}>
                                                        <ul>
                                                                {events.map((event: Event) => {
                                                                        const eventDate = new Date(event.dateevent);
                                                                        eventDate.setHours(0, 0, 0, 0);
                                                                        if (eventDate.getTime() === today.getTime()) {
                                                                                count_today++;
                                                                                return (
                                                                                        <li key={event.id}>
                                                                                                <div className={styles.activity}>
                                                                                                        <div className={styles.activity_header}>
                                                                                                                <img src="/globe.svg" alt="icone" />
                                                                                                                <h2>{event.eventtype}</h2>
                                                                                                                <input type="checkbox" name="checkbox" />
                                                                                                        </div>
                                                                                                        <div className={styles.activity_body}>
                                                                                                                <div>
                                                                                                                        <h2>{event.nom}</h2>
                                                                                                                        <p>{eventDate.toLocaleDateString()}</p>
                                                                                                                </div>
                                                                                                                <h3>VOIR LES DETAILS</h3>
                                                                                                        </div>
                                                                                                </div>
                                                                                        </li>
                                                                                );
                                                                        }
                                                                        return null;
                                                                })}
                                                                {count_today === 0 && <h3>Vous n'avez aucun événement aujourd'hui.</h3>}
                                                        </ul>
                                                </div>
                                        </div>
                                </div>

                                <div className={styles.page_section /*Partie du milieu*/}>
                                        <div className={styles.tab_medium}>
                                                <div className={styles.tab_header}>
                                                        <span></span>
                                                        <p>A venir</p>
                                                        <span></span>
                                                </div>
                                                <div className={styles.tab_content}>
                                                        <ul>
                                                                {events.map((event: Event) => {
                                                                        const eventDate = new Date(event.dateevent);
                                                                        eventDate.setHours(0, 0, 0, 0);
                                                                        if (eventDate > today) {
                                                                                count_later++;
                                                                                return (
                                                                                        <li key={event.id}>
                                                                                                <div className={styles.activity}>
                                                                                                        <div className={styles.activity_header}>
                                                                                                                <img src="/globe.svg" alt="icone" />
                                                                                                                <h2>{event.eventtype}</h2>
                                                                                                                <input type="checkbox" name="checkbox" />
                                                                                                        </div>
                                                                                                        <div className={styles.activity_body}>
                                                                                                                <div>
                                                                                                                        <h2>{event.nom}</h2>
                                                                                                                        <p>{eventDate.toLocaleDateString()}</p>
                                                                                                                </div>
                                                                                                                <h3>VOIR LES DETAILS</h3>
                                                                                                        </div>
                                                                                                </div>
                                                                                        </li>
                                                                                );
                                                                        }
                                                                        return null;
                                                                })}
                                                                {count_later === 0 && <h3>Vous n'avez aucun événement à venir.</h3>}
                                                        </ul>
                                                </div>
                                        </div>
                                        <div className={styles.tab_small}>
                                                <div className={styles.tab_header}>
                                                        <span></span>
                                                        <p>En retard</p>
                                                        <span></span>
                                                </div>
                                                <div className={styles.tab_content}>

                                                        <ul>
                                                                {events.map((event: Event) => {
                                                                        const eventDate = new Date(event.dateevent);
                                                                        eventDate.setHours(0, 0, 0, 0);
                                                                        if (eventDate < today) {
                                                                                count_late++;
                                                                                return (
                                                                                        <li key={event.id}>
                                                                                                <div className={styles.activity}>
                                                                                                        <div className={styles.activity_header}>
                                                                                                                <img src="/globe.svg" alt="icone" />
                                                                                                                <h2>{event.eventtype}</h2>
                                                                                                                <input type="checkbox" name="checkbox" />
                                                                                                        </div>
                                                                                                        <div className={styles.activity_body}>
                                                                                                                <div>
                                                                                                                        <h2>{event.nom}</h2>
                                                                                                                        <p>{eventDate.toLocaleDateString()}</p>
                                                                                                                </div>
                                                                                                                <h3>VOIR LES DETAILS</h3>
                                                                                                        </div>
                                                                                                </div>
                                                                                        </li>
                                                                                );
                                                                        }
                                                                        return null;
                                                                })}
                                                                {count_late === 0 && <h3>Vous n'avez aucun événement à venir.</h3>}
                                                        </ul>
                                                </div>
                                        </div>
                                </div>
                                <div className={styles.tab_large /*Partie droite*/}>
                                        <div className={styles.tab_header}>
                                                <span></span>
                                                <p>Objectifs</p>
                                                <span></span>
                                        </div>
                                        <div className={styles.tab_content}>
                                                <ul>
                                                        {objectifs && objectifs.length > 0 ? (
                                                                objectifs.map((objectif: Objectifs) => {
                                                                        const objectifDate = new Date(objectif.datedebut);
                                                                        objectifDate.setHours(0, 0, 0, 0);
                                                                        return (
                                                                                <li key={objectif.id}>
                                                                                        <div className={styles.activity}>
                                                                                                <div className={styles.activity_header}>
                                                                                                        <img src="/globe.svg" alt="icone" />
                                                                                                        <h2>{objectif.title}</h2>
                                                                                                        <input type="checkbox" name="checkbox" />
                                                                                                </div>
                                                                                                <div className={styles.activity_body}>
                                                                                                        <div>
                                                                                                                <p>{objectifDate.toLocaleDateString()}</p>
                                                                                                        </div>
                                                                                                        <h3>VOIR LES DETAILS</h3>
                                                                                                </div>
                                                                                        </div>
                                                                                </li>
                                                                        );
                                                                })
                                                        ) : (
                                                                <h3>Vous n'avez aucun objectif.</h3>
                                                        )}
                                                </ul>

                                        </div>
                                </div>
                        </div>
                </div>
        );
}
