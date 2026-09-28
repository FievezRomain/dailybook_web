import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';

import { EventDrawerProvider, useEventDrawer } from './event-drawer-context';
import { EventFormDrawerProvider, useEventFormDrawer } from './event-form-drawer-context';

const event = { id: 8, nom: 'Vaccin' };

describe('contextes des fenêtres événement', () => {
  it('ouvre puis ferme la fiche de détail', () => {
    const wrapper = ({ children }: PropsWithChildren) => <EventDrawerProvider>{children}</EventDrawerProvider>;
    const { result } = renderHook(() => useEventDrawer(), { wrapper });

    act(() => result.current.openDrawer(event as never));
    expect(result.current.drawer).toMatchObject({ open: true, event });
    act(() => result.current.closeDrawer());
    expect(result.current.drawer).toMatchObject({ open: false, event: null });
  });

  it('incrémente chaque instance du formulaire et conserve sa clé à la fermeture', () => {
    const wrapper = ({ children }: PropsWithChildren) => <EventFormDrawerProvider>{children}</EventFormDrawerProvider>;
    const { result } = renderHook(() => useEventFormDrawer(), { wrapper });

    act(() => result.current.openDrawer({ initialEvent: event as never, isDuplicate: true }));
    expect(result.current.drawer).toMatchObject({ open: true, instanceKey: 1, isDuplicate: true });
    act(() => result.current.closeDrawer());
    expect(result.current.drawer).toMatchObject({ open: false, instanceKey: 1 });
    act(() => result.current.openDrawer());
    expect(result.current.drawer.instanceKey).toBe(2);
  });

  it('refuse un usage hors fournisseur', () => {
    expect(() => renderHook(() => useEventDrawer())).toThrow('EventDrawerProvider');
    expect(() => renderHook(() => useEventFormDrawer())).toThrow('EventFormDrawerProvider');
  });
});
