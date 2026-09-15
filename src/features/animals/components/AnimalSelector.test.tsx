import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Animal } from '../types/animal';
import { AnimalSelector } from './AnimalSelector';

vi.mock('./AnimalAvatar', () => ({ AnimalAvatar: ({ animal }: { animal: { nom?: string | null } }) => <span aria-hidden="true">{animal.nom}</span> }));

const animals = [
  { id: 1, nom: 'Vasco', provenance: 'owner' },
  { id: 2, nom: 'Ariane', provenance: 'shared' },
] satisfies Animal[];

describe('AnimalSelector', () => {
  it('expose le sélecteur exclusif comme un groupe de boutons radio', () => {
    const onChange = vi.fn();
    render(<AnimalSelector animals={animals} selectedIds={[1]} onChange={onChange} onUpdateAnimalImage={vi.fn()} singleSelect />);

    expect(screen.getByRole('radiogroup', { name: 'Animaux disponibles' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Vasco/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Ariane, animal partagé' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Sélectionner un animal' })).not.toHaveClass('border', 'rounded-surface');
    expect(screen.getByRole('radio', { name: /Vasco/ }).querySelector('span')).toHaveClass('bg-gradient-to-br');
    expect(screen.getByRole('radio', { name: /Ariane/ }).querySelector('span')).not.toHaveClass('ring-1', 'ring-border');

    fireEvent.click(screen.getByRole('radio', { name: /Ariane/ }));
    expect(onChange).toHaveBeenCalledWith([2]);
  });

  it('préserve la sélection multiple et l’action Tous', () => {
    const onChange = vi.fn();
    render(<AnimalSelector animals={animals} selectedIds={[1]} onChange={onChange} onUpdateAnimalImage={vi.fn()} showSelectAll />);

    fireEvent.click(screen.getByRole('button', { name: 'Ariane, animal partagé' }));
    expect(onChange).toHaveBeenCalledWith([1, 2]);

    fireEvent.click(screen.getByRole('button', { name: 'Tous' }));
    expect(onChange).toHaveBeenLastCalledWith([1, 2]);
  });
});
