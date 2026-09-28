import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Animal } from '../types/animal';
import { AnimalGeneralCard } from './AnimalGeneralCard';

const animal = {
  id: 1,
  nom: 'Vasco',
  provenance: 'shared',
} satisfies Animal;

describe('AnimalGeneralCard', () => {
  it('n’affiche pas d’indication de propriété pour un animal partagé', () => {
    render(
      <AnimalGeneralCard animal={animal} isLoading={false} />,
    );

    expect(screen.queryByText('Partagé via un groupe · lecture seule')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Options animal' })).not.toBeInTheDocument();
  });

  it('n’affiche pas d’indication de propriété pour son propre animal', () => {
    render(
      <AnimalGeneralCard
        animal={{ ...animal, provenance: 'owner' }}
        isLoading={false}
      />,
    );

    expect(screen.queryByText('Vous êtes propriétaire')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Options animal' })).not.toBeInTheDocument();
  });
});
