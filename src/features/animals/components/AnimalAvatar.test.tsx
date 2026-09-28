import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Animal } from '../types/animal';
import { AnimalAvatar } from './AnimalAvatar';

const animal = {
  id: 1,
  nom: '  vasco',
  provenance: 'owner',
} satisfies Animal;

describe('AnimalAvatar', () => {
  it('affiche une initiale sur un fond de fallback sans photo', () => {
    render(<AnimalAvatar animal={animal} onUpdateAnimalImage={vi.fn()} width={44} height={44} />);

    const initial = screen.getByText('V');
    expect(initial).toHaveClass('font-bold');
    expect(initial.parentElement).toHaveClass('bg-muted', 'text-primary');
  });

  it('remplace aussi une photo invalide par le fallback', () => {
    const animalWithImage = {
      ...animal,
      image: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.jpg',
      imageSigned: {
        url: 'https://images.example.test/vasco.jpg',
        expiresAt: Date.now() + 60_000,
      },
    } satisfies Animal;

    render(<AnimalAvatar animal={animalWithImage} onUpdateAnimalImage={vi.fn()} width={44} height={44} />);
    fireEvent.error(screen.getByRole('img', { name: 'vasco' }));

    expect(screen.getByText('V').parentElement).toHaveClass('bg-muted', 'text-primary');
  });
});
