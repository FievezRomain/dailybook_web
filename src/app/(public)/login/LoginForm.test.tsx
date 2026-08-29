import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LoginForm from './LoginForm';

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  verified: vi.fn(),
  establishSession: vi.fn(),
  replace: vi.fn(),
}));

vi.mock('@/lib/firebaseService', () => ({
  signInUser: mocks.signIn,
  isEmailVerified: mocks.verified,
}));
vi.mock('@/features/user/api/user-api', () => ({ establishAuthenticatedSession: mocks.establishSession }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace }) }));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signIn.mockResolvedValue({ user: { uid: 'user-1' } });
    mocks.verified.mockResolvedValue(true);
    mocks.establishSession.mockResolvedValue(undefined);
  });

  it('expose un formulaire libellé et une navigation d’inscription', () => {
    render(<LoginForm />);

    expect(screen.getByRole('heading', { name: 'Connexion' })).toBeVisible();
    expect(screen.getByLabelText('Adresse e-mail')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.getByRole('link', { name: 'S’inscrire' })).toHaveAttribute('href', '/register');
  });

  it('ouvre la session complète avant de rediriger', async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'vasco@example.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'secret-test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    await waitFor(() => expect(mocks.establishSession).toHaveBeenCalledWith({ uid: 'user-1' }));
    expect(mocks.replace).toHaveBeenCalledWith('/dashboard');
  });
});
