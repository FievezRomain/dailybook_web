import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ getCurrentUser: vi.fn(), getUserPictureUrl: vi.fn() }));
vi.mock('../api/user-api', () => ({ getCurrentUser: api.getCurrentUser }));
vi.mock('../api/user-picture', () => ({ getUserPictureUrl: api.getUserPictureUrl }));
import { useCurrentUser } from './use-current-user';

const profile = { id: 1, name: 'Fixture', email: 'fixture@example.invalid', picture: null, expotoken: null, timezone: 'Europe/Paris', dailyReminderEnabled: true, subscription: 'Free' };
const clients: QueryClient[] = [];
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });
  clients.push(client);
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return renderHook(useCurrentUser, { wrapper });
}
beforeEach(() => { vi.clearAllMocks(); focusManager.setFocused(true); onlineManager.setOnline(true); api.getCurrentUser.mockResolvedValue(profile); });
afterEach(() => { cleanup(); clients.splice(0).forEach(client => client.clear()); focusManager.setFocused(undefined); onlineManager.setOnline(true); });

it('refreshes a still-fresh profile when returning to the tab', async () => {
  const { result } = setup();
  await waitFor(() => expect(result.current.user?.subscription).toBe('Free'));
  api.getCurrentUser.mockResolvedValue({ ...profile, subscription: 'Premium' });
  act(() => { focusManager.setFocused(false); focusManager.setFocused(true); });
  await waitFor(() => expect(result.current.isPremium).toBe(true));
  expect(api.getCurrentUser).toHaveBeenCalledTimes(2);
});
it('applies revocation on return without a manual logout', async () => {
  api.getCurrentUser.mockResolvedValue({ ...profile, subscription: 'Premium' });
  const { result } = setup();
  await waitFor(() => expect(result.current.isPremium).toBe(true));
  api.getCurrentUser.mockResolvedValue(profile);
  act(() => { focusManager.setFocused(false); focusManager.setFocused(true); });
  await waitFor(() => expect(result.current.isPremium).toBe(false));
});
it('retries the profile when connectivity returns', async () => {
  const { result } = setup();
  await waitFor(() => expect(result.current.user).toBeDefined());
  api.getCurrentUser.mockResolvedValue({ ...profile, subscription: 'Premium' });
  act(() => { onlineManager.setOnline(false); onlineManager.setOnline(true); });
  await waitFor(() => expect(result.current.isPremium).toBe(true));
});
it('exposes an error and keeps last-known data when the refresh fails', async () => {
  const { result } = setup();
  await waitFor(() => expect(result.current.user).toBeDefined());
  api.getCurrentUser.mockRejectedValue(new Error('unavailable'));
  act(() => { focusManager.setFocused(false); focusManager.setFocused(true); });
  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.isPremium).toBe(false);
  expect(result.current.user?.subscription).toBe('Free');
});
