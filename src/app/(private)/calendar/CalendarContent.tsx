'use client';

import { getEvents } from "@/api/events";
import { Event } from "@/types/event";
import useSWR from "swr";
import styles from '@/styles/pages/dashboard.module.scss';
import Calendar from "react-calendar";
import styled from 'styled-components';

const CalendarContainer = styled.div`
  /* Your custom styles here */
  max-width: 600px;
  margin: auto;
  margin-top: 20px;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgb(var(--color-baie-transparent-fond));
  div{
        justify-self: center;
  }
`;


type Props = {
        prenom: string;
        initialEvents: Event[];
        token: string;
};


export default function CalendarContent({ initialEvents, token, prenom }: Props) {
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
                                        <CalendarContainer>
                                                <Calendar></Calendar>
                                        </CalendarContainer>

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
