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

export default function ObjectifsContent({ initialEvents, token, prenom }: Props) {
        const { data: events = initialEvents, isLoading } = useSWR(['events', token], () => getEvents(token));

        return (
                <div className={styles.page_body}>
                        <div className={styles.page_container}>
                                <div className={styles.page_section /*Partie gauche*/}>
                                </div>
                                <div className={styles.page_section /*Partie droite*/}>
                                        <div className={styles.tab_large}>
                                                <div className={styles.tab_header}>
                                                        <span></span>
                                                        <p>
                                                                Objectifs
                                                        </p>
                                                        <span></span>
                                                </div>
                                                <div className={styles.tab_content}>

                                                </div>

                                        </div>
                                </div>

                        </div>
                </div>
        )
}