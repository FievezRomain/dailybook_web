'use client';

import { getEvents } from "@/api/events";
import { Event } from "@/types/event";
import useSWR from "swr";

type Props = {
  email: string;
  initialEvents: Event[];
  token: string;
};

export default function DashboardContent({ email, initialEvents, token }: Props) {
  const { data: events = initialEvents, isLoading } = useSWR(['events', token], () => getEvents(token));

  return (
    <div>
      <h1>Bienvenue {email} 👋</h1>

      {isLoading && <p>Chargement des événements...</p>}

      <ul>
        {events.map((event: Event) => (
          <li key={event.id}>
            <strong>{event.nom}</strong> – {new Date(event.dateevent).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
