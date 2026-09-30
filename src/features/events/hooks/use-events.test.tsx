import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  getEvents: vi.fn(),
  getEventHighlights: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  patchEvent: vi.fn(),
  deleteEvent: vi.fn(),
}));

vi.mock('../api/events-api', () => api);

import { useEventHighlights, useEventsQuery } from './use-events';

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

describe('use-events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getEvents.mockResolvedValue([]);
  });

  it('invalide les listes filtrées après chaque mutation', async () => {
    const { wrapper } = setup();
    const event = { id: 8, nom: 'Vaccin' };
    api.createEvent.mockResolvedValue([event]);
    api.updateEvent.mockResolvedValue([{ ...event, nom: 'Rappel' }]);
    api.patchEvent.mockResolvedValue([{ ...event, state: 'Terminé' }]);
    api.deleteEvent.mockResolvedValue([]);
    const { result } = renderHook(() => useEventsQuery(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => { await result.current.createEvent({ nom: 'Vaccin' } as never); });
    await act(async () => { await result.current.updateEvent(8, { nom: 'Rappel' } as never); });
    await act(async () => { await result.current.patchEvent(8, { state: 'Terminé' } as never); });
    await act(async () => { await result.current.deleteEvent(8, 'series'); });

    expect(api.updateEvent).toHaveBeenCalledWith(8, { nom: 'Rappel' });
    expect(api.patchEvent).toHaveBeenCalledWith(8, { state: 'Terminé' });
    expect(api.deleteEvent).toHaveBeenCalledWith(8, 'series');
    expect(api.getEvents.mock.calls.length).toBeGreaterThan(1);
  });

  it('charge les temps forts pour l’année demandée', async () => {
    api.getEventHighlights.mockResolvedValue([{ id: 'birthday' }]);
    const { wrapper } = setup();
    const { result } = renderHook(() => useEventHighlights(2026), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([{ id: 'birthday' }]));
    expect(api.getEventHighlights).toHaveBeenCalledWith(2026);
  });
});
