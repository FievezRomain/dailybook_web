import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WishesContent from './WishesContent';

const mocks = vi.hoisted(() => ({ query: vi.fn(), create: vi.fn() }));
vi.mock('../hooks/use-wishes', () => ({ useWishesQuery: mocks.query }));

describe('WishesContent', () => {
  beforeEach(() => {
    mocks.create.mockReset().mockResolvedValue({ id: 3, nom: 'Selle', acquis: false });
    mocks.query.mockReturnValue({ wishes: [], isLoading: false, isError: false, isMutating: false, createWish: mocks.create, updateWish: vi.fn(), deleteWish: vi.fn(), refetch: vi.fn() });
  });

  it('crée un souhait avec ses métadonnées validées', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><WishesContent /></QueryClientProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Nouveau souhait' }));
    fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Selle' } });
    fireEvent.change(screen.getByLabelText('Lien'), { target: { value: 'https://example.com/selle' } });
    fireEvent.change(screen.getByLabelText('Prix estimé'), { target: { value: '200' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer le souhait' }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalledWith({ nom: 'Selle', url: 'https://example.com/selle', prix: '200', destinataire: null, image: null }));
  });
});
