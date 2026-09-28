import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AnimalFormDrawer } from './AnimalFormDrawer';

vi.mock('../hooks/use-animal-form', () => ({
  useAnimalForm: () => ({
    values: { nom: 'Vasco', espece: 'Cheval', datenaissance: '2020-01-01' },
    errors: { nom: 'Le nom est requis' },
    handleChange: vi.fn(), handleTextareaChange: vi.fn(), resetForm: vi.fn(), setValues: vi.fn(),
    handleSubmit: (callback: (values: object) => void) => (event: React.FormEvent) => {
      event.preventDefault();
      callback({ nom: 'Vasco', espece: 'Cheval', datenaissance: '2020-01-01' });
    },
  }),
}));

describe('AnimalFormDrawer', () => {
  it('annonce le mode édition et expose l’erreur du nom', () => {
    render(<AnimalFormDrawer open onClose={vi.fn()} onSubmit={vi.fn()} initialAnimal={{ id: 1 }} />);

    expect(screen.getByRole('heading', { name: 'Modifier Vasco' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Nom/ })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Le nom est requis')).toBeVisible();
    expect(screen.getByLabelText('Date de naissance')).not.toBeRequired();
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('annonce une mutation en cours', () => {
    render(<AnimalFormDrawer open onClose={vi.fn()} onSubmit={vi.fn()} isSubmitting />);

    expect(screen.getByRole('form')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeDisabled();
  });

  it('affiche les unités des mesures physiques', async () => {
    const user = userEvent.setup();
    render(<AnimalFormDrawer open onClose={vi.fn()} onSubmit={vi.fn()} initialAnimal={{ id: 1 }} />);

    await user.click(screen.getByRole('button', { name: 'Continuer' }));

    expect(screen.getByText('kg')).toBeVisible();
    expect(screen.getByText('cm')).toBeVisible();
    expect(screen.getByRole('textbox', { name: /Poids/ })).toHaveClass('pr-16');
    expect(screen.getByRole('textbox', { name: /Taille/ })).toHaveClass('pr-16');
  });

});
