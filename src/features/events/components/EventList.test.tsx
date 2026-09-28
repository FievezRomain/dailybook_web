import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  patchEvent: vi.fn(), openDetail: vi.fn(), openDelete: vi.fn(), openForm: vi.fn(),
  updateAnimalImage: vi.fn(), success: vi.fn(), error: vi.fn(),
}));

vi.mock('@/features/animals/hooks/use-animals', () => ({
  useAnimalsQuery: () => ({ animals: [], updateAnimalImage: mocks.updateAnimalImage }),
}));
vi.mock('@/features/events/hooks/use-events', () => ({
  useEventsQuery: () => ({ patchEvent: mocks.patchEvent }),
}));
vi.mock('@/features/events/context/event-drawer-context', () => ({
  useEventDrawer: () => ({ openDrawer: mocks.openDetail }),
}));
vi.mock('@/features/events/context/event-delete-context', () => ({
  useEventDelete: () => ({ openDelete: mocks.openDelete }),
}));
vi.mock('@/features/events/context/event-form-drawer-context', () => ({
  useEventFormDrawer: () => ({ openDrawer: mocks.openForm }),
}));
vi.mock('sonner', () => ({ toast: { success: mocks.success, error: mocks.error } }));
vi.mock('./EventCardWrapper', () => ({
  EventCardWrapper: (props: {
    event: { id: number; state: string };
    onComplete: (id: number, event: { state: string }) => void;
    onDelete: () => void;
    onEdit: () => void;
    onDuplicate: () => void;
    onOpenDrawer: () => void;
  }) => (
    <div>
      <button onClick={() => props.onComplete(props.event.id, { state: 'Terminé' })}>Terminer</button>
      <button onClick={props.onEdit}>Modifier</button>
      <button onClick={props.onDuplicate}>Dupliquer</button>
      <button onClick={props.onDelete}>Supprimer</button>
      <button onClick={props.onOpenDrawer}>Détails</button>
    </div>
  ),
}));

import { EventList } from './EventList';

const event = {
  id: 8, nom: 'Vaccin', dateevent: '2026-09-20', animaux: [], eventtype: 'soins',
  state: 'À faire', documents: [], shared_groups: [], todisplay: true,
};

describe('EventList', () => {
  beforeEach(() => vi.clearAllMocks());

  it('affiche un état vide explicite', () => {
    render(<EventList events={[]} />);
    expect(screen.getByText('Aucun événement')).toBeVisible();
  });

  it('relie toutes les actions de la carte aux parcours événement', async () => {
    const user = userEvent.setup();
    mocks.patchEvent.mockResolvedValue(undefined);
    render(<EventList events={[event as never]} />);

    await user.click(screen.getByRole('button', { name: 'Modifier' }));
    await user.click(screen.getByRole('button', { name: 'Dupliquer' }));
    await user.click(screen.getByRole('button', { name: 'Supprimer' }));
    await user.click(screen.getByRole('button', { name: 'Détails' }));
    await user.click(screen.getByRole('button', { name: 'Terminer' }));

    expect(mocks.openForm).toHaveBeenNthCalledWith(1, expect.objectContaining({ initialEvent: expect.objectContaining({ id: 8 }) }));
    expect(mocks.openForm).toHaveBeenNthCalledWith(2, expect.objectContaining({ isDuplicate: true }));
    expect(mocks.openDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 8 }));
    expect(mocks.openDetail).toHaveBeenCalledWith(expect.objectContaining({ id: 8 }));
    expect(mocks.patchEvent).toHaveBeenCalledWith(8, { state: 'Terminé' });
    expect(mocks.success).toHaveBeenCalledOnce();
  });

  it('affiche une erreur lorsque le changement d’état échoue', async () => {
    const user = userEvent.setup();
    mocks.patchEvent.mockRejectedValue(new Error('backend indisponible'));
    render(<EventList events={[event as never]} />);

    await user.click(screen.getByRole('button', { name: 'Terminer' }));

    expect(mocks.error).toHaveBeenCalledOnce();
  });
});
