import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import AnimalsContent from './AnimalsContent';

vi.mock('./AnimalSelector', () => ({ AnimalSelector: () => <div>Animal selector</div> }));
vi.mock('./AnimalGeneralCard', () => ({ AnimalGeneralCard: () => <div>Informations</div> }));
vi.mock('./AnimalPhysicalCard', () => ({ AnimalPhysicalCard: () => <div>Physique</div> }));
vi.mock('./AnimalHealthCard', () => ({ AnimalHealthCard: () => <div>Santé</div> }));
vi.mock('./AnimalEvolutionCard', () => ({ AnimalEvolutionCard: () => <div>Évolution</div> }));
vi.mock('@/features/events/hooks/use-events', () => ({ useEventsQuery: () => ({ events: [], isLoading: false }) }));
vi.mock('@/features/animals/hooks/use-animals', () => ({
  useAnimalsQuery: () => ({
    animals: [{ id: 1, nom: 'Vasco', provenance: 'owner' }],
    isLoading: false,
    isError: false,
    error: null,
    updateAnimalImage: vi.fn(),
    deleteAnimal: vi.fn(),
  }),
}));
vi.mock('@/features/animals/context/animal-form-drawer-context', () => ({ useAnimalFormDrawer: () => ({ openDrawer: vi.fn() }) }));
vi.mock('@/features/user/hooks/use-current-user', () => ({ useCurrentUser: () => ({ isPremium: false }) }));
vi.mock('@/shared/components/feedback/ConfirmDialog', () => ({ ConfirmDialog: () => null }));

describe('AnimalsContent', () => {
  it('compose la fiche dans la grille asymétrique responsive', () => {
    render(<AnimalsContent />);

    const workspace = screen.getByRole('region', { name: 'Fiche animale' });
    expect(workspace).toHaveClass('md:grid-cols-2', 'xl:grid-cols-12');
    expect(screen.getByText('Informations').parentElement).toHaveClass('xl:col-span-5');
    expect(screen.getByText('Santé').parentElement).toHaveClass('xl:col-span-7');
    expect(screen.getByText('Physique').parentElement).toHaveClass('xl:col-span-7');
    expect(screen.getByText('Évolution').parentElement).toHaveClass('xl:col-span-5');
  });
});
