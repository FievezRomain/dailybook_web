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
    updateAnimal: vi.fn(),
    deleteAnimal: vi.fn(),
    isMutating: false,
  }),
}));
vi.mock('@/features/animals/context/animal-form-drawer-context', () => ({ useAnimalFormDrawer: () => ({ openDrawer: vi.fn() }) }));
vi.mock('@/features/user/hooks/use-current-user', () => ({ useCurrentUser: () => ({ isPremium: false }) }));
vi.mock('@/shared/components/feedback/ConfirmDialog', () => ({ ConfirmDialog: () => null }));

describe('AnimalsContent', () => {
  it('compose la fiche dans deux colonnes indépendantes sans espaces de ligne', () => {
    render(<AnimalsContent />);

    const workspace = screen.getByRole('region', { name: 'Fiche animale' });
    expect(workspace).toHaveClass('lg:grid-cols-2');
    const identityColumn = screen.getByText('Informations').parentElement;
    const trackingColumn = screen.getByText('Physique').parentElement;
    expect(identityColumn).toHaveClass('grid', 'content-start', 'gap-5');
    expect(identityColumn).toContainElement(screen.getByText('Santé'));
    expect(trackingColumn).toHaveClass('grid', 'content-start', 'gap-5');
    expect(trackingColumn).toContainElement(screen.getByText('Évolution'));
    const optionsButton = screen.getByRole('button', { name: 'Options animal' });
    expect(screen.getByRole('region', { name: 'Aperçu de Vasco' })).toContainElement(optionsButton);
    expect(optionsButton).toHaveClass('absolute', 'right-4', 'top-4', 'size-12');
    expect(optionsButton.querySelector('svg')).toHaveClass('size-6');
    expect(workspace).not.toContainElement(screen.getByRole('button', { name: 'Options animal' }));
  });
});
