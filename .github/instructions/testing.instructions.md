---
applyTo: "src/**"
---

# Tests — Web MyDailyBook

## Stack
- **Unit / Component** : Vitest + @testing-library/react + @testing-library/user-event
- **E2E** : Playwright
- Aucun test existant actuellement — ce fichier définit la cible à mettre en place

## Installation

```bash
# Vitest + RTL
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @vitest/coverage-v8

# Playwright
npm install -D @playwright/test
npx playwright install chromium firefox
```

### `vitest.config.ts` (à créer à la racine)
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: { lines: 70, functions: 70, branches: 70 },
      exclude: ['src/app/api/**', 'src/lib/firebase*.ts', '**/*.config.*'],
    },
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
});
```

### `src/tests/setup.ts`
```typescript
import '@testing-library/jest-dom';
// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  redirect: vi.fn(),
}));
// Mock next-themes
vi.mock('next-themes', () => ({ useTheme: () => ({ theme: 'light', setTheme: vi.fn() }) }));
```

### `playwright.config.ts` (à créer à la racine)
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 15'] } },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Tests de composants — pattern

```typescript
// src/features/animals/components/__tests__/AnimalCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnimalCard } from '../AnimalCard';
import { createMockAnimal } from '@/tests/factories/animal.factory';

describe('AnimalCard', () => {
  it('affiche le nom de l\'animal', () => {
    render(<AnimalCard animal={createMockAnimal()} />);
    expect(screen.getByText('Tornado')).toBeInTheDocument();
  });

  it('appelle onEdit au clic sur l\'action éditer', async () => {
    const onEdit = vi.fn();
    render(<AnimalCard animal={createMockAnimal()} onEdit={onEdit} />);
    await userEvent.click(screen.getByRole('button', { name: /éditer/i }));
    expect(onEdit).toHaveBeenCalledOnce();
  });
});
```

## Tests de hooks SWR — pattern

```typescript
// src/features/animals/hooks/__tests__/useAnimalsData.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useAnimalsData } from '../useAnimalsData';
import { createMockAnimal } from '@/tests/factories/animal.factory';

vi.mock('../services/animals.service', () => ({
  AnimalsService: { getAll: vi.fn() },
}));

describe('useAnimalsData', () => {
  it('retourne la liste des animaux', async () => {
    vi.mocked(AnimalsService.getAll).mockResolvedValue([createMockAnimal()]);
    const { result } = renderHook(() => useAnimalsData());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.animals).toHaveLength(1);
  });
});
```

## Factories — `src/tests/factories/`

```typescript
// src/tests/factories/animal.factory.ts
import type { Animal } from '@/features/animals/types';

export const createMockAnimal = (overrides: Partial<Animal> = {}): Animal => ({
  id: 1,
  name: 'Tornado',
  race: 'Cheval de sport',
  userId: 'user_test',
  createdAt: new Date().toISOString(),
  ...overrides,
});
```

## E2E Playwright — Page Object Model

```
e2e/
├── pages/
│   ├── LoginPage.ts
│   ├── AnimalsPage.ts
│   └── CalendarPage.ts
├── flows/
│   ├── auth.spec.ts
│   ├── animals.spec.ts
│   └── events.spec.ts
└── fixtures/
    └── auth.fixture.ts      # Fixture de session authentifiée
```

```typescript
// e2e/pages/AnimalsPage.ts
import { Page } from '@playwright/test';

export class AnimalsPage {
  constructor(private page: Page) {}

  async goto() { await this.page.goto('/animals'); }
  async clickAddAnimal() { await this.page.getByRole('button', { name: 'Ajouter' }).click(); }
  async fillName(name: string) { await this.page.getByLabel('Nom').fill(name); }
  async submit() { await this.page.getByRole('button', { name: 'Enregistrer' }).click(); }
  async getAnimalNames() { return this.page.getByTestId('animal-name').allTextContents(); }
}

// e2e/flows/animals.spec.ts
test('créer un cheval', async ({ page, authenticatedPage }) => {
  const animalsPage = new AnimalsPage(page);
  await animalsPage.goto();
  await animalsPage.clickAddAnimal();
  await animalsPage.fillName('Tornado');
  await animalsPage.submit();
  await expect(page.getByText('Tornado')).toBeVisible();
});
```

## Flows E2E obligatoires
1. `auth.spec.ts` — login, logout, redirect vers `/login` si non authentifié
2. `animals.spec.ts` — créer et afficher un cheval
3. `events.spec.ts` — créer et afficher un événement

## Scripts package.json à ajouter
```json
"test": "vitest",
"test:coverage": "vitest --coverage",
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```
