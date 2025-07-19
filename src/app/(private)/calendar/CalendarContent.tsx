'use client';

import { getEvents } from "@/api/events";
import { Event } from "@/types/event";
import { getObjectifs } from "@/api/objectifs";
import { Objectifs } from "@/types/objectifs";
import useSWR from "swr";
import styles from '@/styles/components/dashboard.module.scss';
import { Calendar } from "@/components/ui/calendar";
import React from "react";
import { DayPicker } from "react-day-picker";

import { useState } from "react";

type Props = {
        email: string;
        initialEvents: Event[];
        initialObjectifs: Objectifs[];
        token: string;
};

let count_day = 0; // Nombre d'événements sur le jour sélectionné


export default function CalendarContent({ initialEvents, token, email }: Props) {
        const { data: events = initialEvents, isLoading: isLoadingEvents } = useSWR(['events', token], () => getEvents(token));
        const [date, setDate] = React.useState<Date | undefined>(new Date())
        const [selected, setSelected] = useState<Date>();

        return (
                <div className={styles.page_body}>
                        <div className={styles.page_container /*Partie gauche*/}>
                                <div className={styles.page_section}>
                                        <input type="text" name="filter"></input>

                                        <div className={styles.page_desc}>
                                                <h2>
                                                        {selected ? `Date : ${selected.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : "choisissez une date."}
                                                </h2>
                                        </div>

                                        {isLoadingEvents && <p>Chargement des événements...</p>}
                                        <DayPicker
                                                animate
                                                mode="single"
                                                selected={selected}
                                                onSelect={setSelected}
                                        /*mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        className="rounded-md border shadow-sm"
                                        captionLayout="dropdown"*/
                                        />

                                </div>
                                <div className={styles.tab_large /*Partie droite*/}>
                                        <div className={styles.tab_header}>
                                                <span></span>
                                                <p>Evénements</p>
                                                <span></span>
                                        </div>
                                        <div className={styles.tab_content}>
                                                <ul>
                                                        {events.map((event: Event) => {
                                                                const eventDate = new Date(event.dateevent);
                                                                eventDate.setHours(0, 0, 0, 0);
                                                                if (eventDate.getTime() === selected?.getTime()) {
                                                                        count_day++;
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
                                                        {count_day === 0 && <h3>Vous n'avez aucun événement à cette date.</h3>}
                                                </ul>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}
