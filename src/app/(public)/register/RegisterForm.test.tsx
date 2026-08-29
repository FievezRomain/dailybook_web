import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RegisterForm from './RegisterForm';

const mocks = vi.hoisted(() => ({ register: vi.fn(), replace: vi.fn() }));

vi.mock('@/lib/firebaseService', () => ({ registerUser: mocks.register }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace }) }));

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.register.mockResolvedValue(undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('associe les quatre champs à leurs libellés et autocomplétions', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText('Adresse e-mail')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Prénom')).toHaveAttribute('autocomplete', 'given-name');
    expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByLabelText('Confirmer le mot de passe')).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByRole('link', { name: 'Se connecter' })).toHaveAttribute('href', '/login');
  });

  it('conserve le formulaire et annonce une confirmation différente', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'vasco@example.com' } });
    fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'Vasco' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'secret-test' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'autre-secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer mon compte' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Les mots de passe ne correspondent pas.');
    expect(screen.getByLabelText('Adresse e-mail')).toHaveValue('vasco@example.com');
    expect(mocks.register).not.toHaveBeenCalled();
  });

  it('transmet le profil complet puis ouvre la vérification e-mail', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'vasco@example.com' } });
    fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'Vasco' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'secret-test' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'secret-test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer mon compte' }));

    await waitFor(() => expect(mocks.register).toHaveBeenCalledWith('vasco@example.com', 'secret-test', 'Vasco'));
    expect(mocks.replace).toHaveBeenCalledWith('/verify-email');
  });
});
