import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Event } from '@/features/events/types/event';
import TodayTasksCard from './TodayTasksCard';

const events: Event[] = [
  { id: 1, nom: 'Vaccin en retard', dateevent: '2026-09-15', eventtype: 'soins', animaux: [], state: 'À faire', documents: [], shared_groups: [], todisplay: true },
  { id: 2, nom: 'Suivi en cours', dateevent: '2026-09-16', eventtype: 'rdv', animaux: [], state: 'En cours', documents: [], shared_groups: [], todisplay: true },
  { id: 3, nom: 'Ancien terminé', dateevent: '2026-09-14', eventtype: 'autre', animaux: [], state: 'Terminé', documents: [], shared_groups: [], todisplay: true },
  { id: 4, nom: 'Balade du jour', dateevent: '2026-09-17', eventtype: 'balade', animaux: [], state: 'À faire', documents: [], shared_groups: [], todisplay: true },
  { id: 5, nom: 'Soin fait aujourd’hui', dateevent: '2026-09-17', eventtype: 'soins', animaux: [], state: 'Terminé', documents: [], shared_groups: [], todisplay: true },
];

vi.mock('@/features/events/hooks/use-events', () => ({
  useEventsQuery: () => ({ events, isLoading: false, isError: false, error: null, refetch: vi.fn() }),
}));

vi.mock('@/features/events/components/EventList', () => ({
  EventList: ({ events: items }: { events: Event[] }) => <ul>{items.map((item) => <li key={item.id}>{item.nom}</li>)}</ul>,
}));

describe('TodayTasksCard', () => {
  afterEach(() => vi.useRealTimers());

  it('affiche les événements passés non terminés avant ceux du jour', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 17, 12));

    render(<TodayTasksCard />);

    expect(screen.getAllByRole('heading', { name: 'Aujourd’hui' })[0]?.closest('[data-slot="card"]')).toHaveClass('p-0');
    expect(screen.getByText(/2 en retard/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'En retard' })).toBeInTheDocument();
    expect(screen.getByText('Vaccin en retard')).toBeInTheDocument();
    expect(screen.getByText('Suivi en cours')).toBeInTheDocument();
    expect(screen.queryByText('Ancien terminé')).not.toBeInTheDocument();
    expect(screen.getByText('Balade du jour')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Tâches réalisées aujourd’hui' })).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByText('1 tâche sur 4 réalisée')).toBeVisible();
    expect(screen.getByText('25 %')).toBeVisible();
  });
});
