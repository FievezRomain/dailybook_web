import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Event } from '@/features/events/types/event';
import { AnimalHealthCard } from './AnimalHealthCard';

vi.mock('@/shared/components/feedback/PremiumGate', () => ({
  PremiumNotice: () => null,
  usePremiumGate: () => ({ handlePremiumError: vi.fn() }),
}));
vi.mock('@/features/events/components/EventList', () => ({
  EventList: ({ events }: { events: Event[] }) => <ul>{events.map((event) => <li key={event.id}>{event.nom}</li>)}</ul>,
}));

function medicalEvent(id: number, overrides: Partial<Event> = {}): Event {
  return {
    id,
    nom: `Soin ${id}`,
    dateevent: `2026-09-${String(id).padStart(2, '0')}`,
    animaux: [12],
    eventtype: 'soins',
    state: 'À faire',
    documents: [],
    shared_groups: [],
    todisplay: true,
    ...overrides,
  };
}

describe('AnimalHealthCard', () => {
  it('masque les états vides et les documents médicaux pour un compte gratuit', () => {
    render(
      <AnimalHealthCard
        isLoading={false}
        events={[]}
        animalId={12}
        isPremium={false}
        canExport={false}
      />,
    );

    expect(screen.queryByText('Aucun élément dans cette vue')).not.toBeInTheDocument();
    expect(screen.queryByText('Les prochains soins et rendez-vous apparaîtront ici.')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Documents médicaux' })).not.toBeInTheDocument();
    expect(screen.queryByText('Les pièces jointes restent visibles après activation de Premium.')).not.toBeInTheDocument();
  });

  it('affiche un chargement pendant la préparation de la synthèse PDF', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(() => new Promise<Response>(() => undefined));
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AnimalHealthCard
        isLoading={false}
        events={[]}
        animalId={12}
        isPremium
        canExport
      />,
    );

    const downloadButton = screen.getByRole('button', { name: 'Synthèse PDF' });
    await user.click(downloadButton);

    expect(fetchMock).toHaveBeenCalledWith('/api/animals/12/medical-record');
    expect(downloadButton).toHaveAttribute('aria-busy', 'true');
    expect(downloadButton).toBeDisabled();
  });

  it('pagine un carnet long et permet de rechercher dans tout l’historique', async () => {
    const user = userEvent.setup();
    const events = Array.from({ length: 8 }, (_, index) => medicalEvent(index + 1));

    render(
      <AnimalHealthCard
        isLoading={false}
        events={events}
        animalId={12}
        isPremium
        canExport={false}
      />,
    );

    expect(screen.getByText('Soin 6')).toBeVisible();
    expect(screen.queryByText('Soin 7')).not.toBeInTheDocument();
    expect(screen.getByText('Page 1 sur 2')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Suivant' }));
    expect(screen.getByText('Soin 7')).toBeVisible();

    await user.type(screen.getByRole('searchbox', { name: 'Rechercher dans le carnet de santé' }), 'Soin 8');
    expect(screen.getByText('Soin 8')).toBeVisible();
    expect(screen.getByText('1 résultat')).toBeVisible();
    expect(screen.queryByText(/Page /)).not.toBeInTheDocument();
  });
});
