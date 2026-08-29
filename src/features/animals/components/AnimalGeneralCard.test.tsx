import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Animal } from '../types/animal';
import { AnimalGeneralCard } from './AnimalGeneralCard';

const animal = {
  id: 1,
  nom: 'Vasco',
  provenance: 'shared',
} satisfies Animal;

describe('AnimalGeneralCard', () => {
  it('identifie un animal partagé et ne propose aucune mutation', () => {
    render(
      <AnimalGeneralCard animal={animal} isLoading={false} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText('Partagé via un groupe · lecture seule')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Options animal' })).not.toBeInTheDocument();
  });

  it('réserve le menu de mutation au propriétaire', () => {
    render(
      <AnimalGeneralCard
        animal={{ ...animal, provenance: 'owner' }}
        isLoading={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('Vous êtes propriétaire')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Options animal' })).toBeInTheDocument();
  });
});
