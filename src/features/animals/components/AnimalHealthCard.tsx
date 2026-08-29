import { useState } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { EventList } from "@/features/events/components/EventList";
import type { Event } from "@/features/events/types/event";
import { Button } from '@/shared/components/ui/button';
import { getEventDocumentUrl } from '@/features/events/api/events-api';
import { openPresignedUrl } from '@/shared/security/presigned-url';
import { getAnimalMedicalDocuments } from '../utils/animal-medical';
import { toast } from 'sonner';
import { PremiumNotice, usePremiumGate } from '@/shared/components/feedback/PremiumGate';

interface AnimalHealthCardProps {
  isLoading: boolean;
  events: Event[];
  animalId: number;
  isPremium: boolean;
  canExport: boolean;
}

const FILTERS = [
  { label: "Tous", value: "all" },
  { label: "Soins", value: "soins" },
  { label: "Rendez-vous", value: "rdv" },
];

export function AnimalHealthCard({ isLoading, events, animalId, isPremium, canExport }: AnimalHealthCardProps) {
  const [filter, setFilter] = useState<"all" | "soins" | "rdv">("all");
  const { handlePremiumError } = usePremiumGate();
  const documents = getAnimalMedicalDocuments(events);

  const filteredEvents = events.filter(e =>
    filter === "all" ? true : e.eventtype === filter
  );

  return (
    <div className="bg-card rounded-xl shadow-sm dark:shadow-lg dark:shadow-black/30 p-6 h-full overflow-hidden flex flex-col max-h-[140dvh]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Carnet de santé</h2>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`px-3 py-1 rounded text-sm transition cursor-pointer ${
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              onClick={() => setFilter(f.value as "all" | "soins" | "rdv")}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {canExport && isPremium ? (
        <a className="mb-4 inline-flex h-9 w-fit items-center rounded-full bg-secondary px-4 text-sm font-medium text-secondary-foreground"
          href={`/api/animals/${animalId}/medical-record`} download>
          Télécharger la synthèse médicale
        </a>
      ) : !isPremium ? (
        <PremiumNotice feature="medicalDocuments" className="mb-4" />
      ) : null}
      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="w-full px-2">
            <EventList events={filteredEvents} />
            <h3 className="mb-2 mt-6 font-semibold">Documents médicaux</h3>
            {!isPremium ? <p className="text-sm text-muted-foreground">Les pièces jointes restent visibles après activation de Premium.</p> : documents.length ? (
              <ul className="space-y-2">
                {documents.map((document) => (
                  <li key={`${document.eventId}-${document.name}`} className="flex items-center justify-between gap-3 rounded-lg bg-muted p-3 text-sm">
                    <span><strong>{document.eventName}</strong> · {new Date(`${document.eventDate}T12:00:00`).toLocaleDateString('fr-FR')}</span>
                    <Button type="button" size="sm" variant="outline" onClick={async () => {
                      try {
                        openPresignedUrl(await getEventDocumentUrl(document.eventId, document.name));
                      } catch (error) {
                        if (!await handlePremiumError(error, 'medicalDocuments')) toast.error(error instanceof Error ? error.message : 'Impossible d’ouvrir ce document.');
                      }
                    }}>Ouvrir</Button>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">Aucun document médical.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
