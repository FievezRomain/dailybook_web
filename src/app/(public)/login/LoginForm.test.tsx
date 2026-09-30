import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LoginForm from './LoginForm';

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signInWithGoogle: vi.fn(),
  verified: vi.fn(),
  establishSession: vi.fn(),
  replace: vi.fn(),
}));

vi.mock('@/lib/firebaseService', () => ({
  signInUser: mocks.signIn,
  signInWithGoogle: mocks.signInWithGoogle,
  isEmailVerified: mocks.verified,
}));
vi.mock('@/features/user/api/user-api', () => ({ establishAuthenticatedSession: mocks.establishSession }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace }), useSearchParams: () => new URLSearchParams() }));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signIn.mockResolvedValue({ user: { uid: 'user-1' } });
    mocks.signInWithGoogle.mockResolvedValue({ user: { uid: 'google-user' } });
    mocks.verified.mockResolvedValue(true);
    mocks.establishSession.mockResolvedValue(undefined);
  });

  it('ouvre une session Vasco après une connexion Google', async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Continuer avec Google' }));

    await waitFor(() => expect(mocks.signInWithGoogle).toHaveBeenCalledTimes(1));
    expect(mocks.establishSession).toHaveBeenCalledWith({ uid: 'google-user' });
    expect(mocks.replace).toHaveBeenCalledWith('/dashboard');
  });

  it('expose un formulaire libellé et une navigation d’inscription', () => {
    render(<LoginForm />);

    expect(screen.getByRole('heading', { name: 'Ravi de vous retrouver.' })).toBeVisible();
    expect(screen.getByLabelText('Adresse e-mail')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.getByRole('link', { name: 'Créer un compte' })).toHaveAttribute('href', '/register');
    fireEvent.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));
    expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Masquer le mot de passe' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('ouvre la session complète avant de rediriger', async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'vasco@example.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'secret-test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    await waitFor(() => expect(mocks.establishSession).toHaveBeenCalledWith({ uid: 'user-1' }));
    expect(mocks.replace).toHaveBeenCalledWith('/dashboard');
  });

  it('traduit une erreur Firebase en message métier compréhensible', async () => {
    mocks.signIn.mockRejectedValue({ code: 'auth/wrong-password', message: 'Firebase: Error (auth/wrong-password).' });
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'vasco@example.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'mauvais-secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Mot de passe incorrect.');
    expect(screen.getByRole('alert')).not.toHaveTextContent('auth/wrong-password');
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeEnabled();
  });
});
