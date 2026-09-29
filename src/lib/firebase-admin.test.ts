import { afterEach, describe, expect, it, vi } from 'vitest';

const firebaseMocks = vi.hoisted(() => ({
  cert: vi.fn(),
  getApps: vi.fn(() => []),
  getAuth: vi.fn(),
  initializeApp: vi.fn(),
}));

vi.mock('firebase-admin/app', () => ({
  cert: firebaseMocks.cert,
  getApps: firebaseMocks.getApps,
  initializeApp: firebaseMocks.initializeApp,
}));
vi.mock('firebase-admin/auth', () => ({ getAuth: firebaseMocks.getAuth }));

describe('getAdminAuth', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('n’exige les secrets Firebase qu’au moment d’une requête serveur', async () => {
    vi.stubEnv('FIREBASE_ADMIN_PROJECT_ID', '');
    vi.stubEnv('FIREBASE_AUTH_EMULATOR_HOST', '');
    vi.stubEnv('FIREBASE_ADMIN_PRIVATE_KEY', '');
    vi.stubEnv('FIREBASE_ADMIN_CLIENT_EMAIL', '');

    const firebaseAdmin = await import('./firebase-admin');

    expect(firebaseMocks.initializeApp).not.toHaveBeenCalled();
    expect(() => firebaseAdmin.getAdminAuth()).toThrow('Missing Firebase admin environment variables');
  });
});
