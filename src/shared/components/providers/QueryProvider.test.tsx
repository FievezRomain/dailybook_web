import { act, render, waitFor } from '@testing-library/react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { User } from 'firebase/auth';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { QueryProvider } from './QueryProvider';

const mocks = vi.hoisted(() => ({ authStateChanged: vi.fn() }));

vi.mock('firebase/auth', () => ({ onAuthStateChanged: mocks.authStateChanged }));
vi.mock('@/lib/firebase', () => ({ auth: {} }));

function QueryClientProbe({ onReady }: { onReady: (client: QueryClient) => void }) {
  onReady(useQueryClient());
  return null;
}

describe('QueryProvider account isolation', () => {
  beforeEach(() => mocks.authStateChanged.mockReset());

  it('clears authenticated data whenever the Firebase identity changes', async () => {
    let listener: ((user: User | null) => void) | undefined;
    let client: QueryClient | undefined;
    mocks.authStateChanged.mockImplementation((_auth: unknown, callback: (user: User | null) => void) => {
      listener = callback;
      return () => undefined;
    });

    render(<QueryProvider><QueryClientProbe onReady={(value) => { client = value; }} /></QueryProvider>);
    client!.setQueryData(['animals'], [{ id: 1, nom: 'Ancien compte' }]);

    act(() => listener?.({ uid: 'first-account' } as User));
    expect(client!.getQueryData(['animals'])).toBeDefined();

    act(() => listener?.({ uid: 'second-account' } as User));
    await waitFor(() => expect(client!.getQueryData(['animals'])).toBeUndefined());
  });
});
