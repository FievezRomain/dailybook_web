import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AnimalHistoryPanel } from './AnimalHistoryPanel';

vi.mock('../hooks/use-animal-history', () => ({
  useAnimalHistory: () => ({
    entries: [], isLoading: false, isError: false, isMutating: false,
    refetch: vi.fn(), createEntry: vi.fn(), updateEntry: vi.fn(), deleteEntry: vi.fn(),
  }),
}));
vi.mock('@/shared/components/feedback/ConfirmDialog', () => ({ ConfirmDialog: () => null }));

describe('AnimalHistoryPanel', () => {
  it('permet de parcourir les historiques au clavier', () => {
    render(<AnimalHistoryPanel animalId={1} canEdit />);

    const weight = screen.getByRole('tab', { name: 'Poids' });
    fireEvent.keyDown(weight, { key: 'ArrowRight' });

    expect(screen.getByRole('tab', { name: 'Taille' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Taille' })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Taille' }), { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Quantité' })).toHaveAttribute('aria-selected', 'true');
  });

  it('conserve la consultation sans mutation pour un animal partagé', () => {
    render(<AnimalHistoryPanel animalId={1} canEdit={false} />);

    expect(screen.getByText('Historique partagé en lecture seule.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ajouter' })).not.toBeInTheDocument();
  });
});
