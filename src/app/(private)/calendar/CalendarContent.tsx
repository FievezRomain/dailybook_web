'use client';

import { getEvents } from "@/api/events";
import { Event } from "@/types/event";
import useSWR from "swr";
import styles from '@/styles/components/dashboard.module.scss';


type Props = {
        email: string;
        initialEvents: Event[];
        token: string;
};


export default function CalendarContent({ initialEvents, token, email }: Props) {
        const { data: events = initialEvents, isLoading } = useSWR(['events', token], () => getEvents(token));

        return (
                <div className={styles.page_body}>
                        <div className={styles.page_container /*Partie gauche*/}>
                                <div className={styles.page_section}>
                                        <div className={styles.page_desc}>
                                                <h2>
                                                        placeholder date
                                                </h2>
                                        </div>

                                        {isLoading && <p>Chargement des événements...</p>}


                                </div>
                                <div className={styles.tab_large /*Partie droite*/}>
                                        <div className={styles.tab_header}>
                                                <span></span>
                                                <p>Evénements</p>
                                                <span></span>
                                        </div>
                                        <div className={styles.tab_content}>

                                        </div>
                                </div>
                        </div>
                </div>
        );
}
