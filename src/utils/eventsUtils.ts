import { Event, MappedEvent } from '@/types/event';
import { differenceInDays, isBefore, startOfDay } from 'date-fns';
import { JSX } from 'react';
import { FaMoneyBillWave, FaTrophy, FaStethoscope, FaCheckCircle } from "react-icons/fa";
import { FaHandHoldingMedical } from "react-icons/fa6";
import { LuTrafficCone } from "react-icons/lu";
import { TiCompass } from "react-icons/ti";

export const filterToday = (events: Event[]) => {
  const today = new Date().toDateString();
  return events.filter(e => new Date(e.dateevent).toDateString() === today);
};

export const filterUpcoming = (events: Event[]) => {
  const now = new Date();
  return events.filter(e => new Date(e.dateevent) > now);
};

export const filterLate = (events: Event[]) => {
  const now = new Date();
  return events.filter(e => new Date(e.dateevent) < now && e.state === "À faire");
};

export const iconsMap: Record<string, React.ComponentType> = {
    depense: FaMoneyBillWave,
    balade: TiCompass,
    soins: FaHandHoldingMedical,
    concours: FaTrophy,
    entrainement: LuTrafficCone,
    autre: FaCheckCircle,
    rdv: FaStethoscope,
};

export const mapEventData = (event: Event): MappedEvent => {

  const colorsMap: Record<string, string> = {
    depense: "--color-rouan",
    balade: "--color-baie",
    soins: "--color-isabelle",
    concours: "--color-primary",
    entrainement: "--color-aubere",
    autre: "--color-baie-cerise",
    rdv: "--color-baie-brun",
  };

  const titleMap: Record<string, string> = {
    depense: "Dépense",
    balade: "Balade",
    soins: "Soins",
    concours: "Concours",
    entrainement: "Entraînement",
    autre: "Autre",
    rdv: "Rendez-vous",
  };

  let delay;
  const eventDate = startOfDay(new Date(event.dateevent));
  if (isBefore(eventDate, startOfDay(new Date()))) {
    delay = differenceInDays(startOfDay(new Date()), eventDate);
  }

  return {
    ...event,
    color: colorsMap[event.eventtype] || "--color-baie-cerise",
    icon: iconsMap[event.eventtype] || FaCheckCircle,
    delay,
    titleType: titleMap[event.eventtype] || "Autre",
  };
};

export const mapEvents = (events: Event[]) => events.map(mapEventData);
