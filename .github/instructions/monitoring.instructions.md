---
applyTo: "src/components/**,src/app/**,src/features/**"
---

# Monitoring Sentry — Web MyDailyBook (Next.js)

## Migration `@sentry/react` → `@sentry/nextjs`

L'intégration actuelle (`@sentry/react`) ne supporte pas le App Router correctement.
Migrer vers `@sentry/nextjs` :

```bash
npm uninstall @sentry/react
npm install @sentry/nextjs
```

> Rappel doc sync : mettre à jour `package.json`, `README.md` section stack.

---

## Fichiers de configuration à créer

### `sentry.client.config.ts`

```typescript
// sentry.client.config.ts (racine du projet)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',
  release: `mydailybook-web@${process.env.NEXT_PUBLIC_APP_VERSION}`,
  tracesSampleRate: 0.1,           // 10% — jamais 1.0 en production
  replaysSessionSampleRate: 0.05,  // 5% des sessions en replay
  replaysOnErrorSampleRate: 1.0,   // 100% des sessions avec erreur
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,           // RGPD — masquer les textes par défaut
      blockAllMedia: false,
    }),
  ],
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') return null;
    return event;
  },
});
```

### `sentry.server.config.ts`

```typescript
// sentry.server.config.ts (racine du projet)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.APP_ENV ?? 'development',
  release: `mydailybook-web@${process.env.APP_VERSION}`,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') return null;
    return event;
  },
});
```

### `sentry.edge.config.ts`

```typescript
// sentry.edge.config.ts (racine du projet)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

---

## `next.config.ts` — Source maps et Sentry Webpack plugin

```typescript
// next.config.ts
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = { /* ... config existante */ };

export default withSentryConfig(nextConfig, {
  org: 'mydailybook',
  project: 'mydailybook-web',
  silent: !process.env.CI,              // Log uploads uniquement en CI
  widenClientFileUpload: true,          // Source maps plus complètes
  hideSourceMaps: true,                 // Ne pas exposer les maps au client
  disableLogger: true,                  // Réduire le bundle
  automaticVercelMonitors: false,
});
```

> Rappel doc sync : modifier `next.config.ts` requiert une vérification de la compatibilité du build.

---

## Contexte utilisateur — `setUser` dans le layout serveur

```typescript
// src/app/(private)/layout.tsx
import * as Sentry from '@sentry/nextjs';
import { getCurrentUser } from '@/lib/auth/server';

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // ✅ Identifier l'utilisateur pour toutes les erreurs SSR de ce layout
  Sentry.setUser({
    id: user.internal_id,    // UUID interne stable
    email: user.email,
  });

  return <>{children}</>;
}
```

Côté client (après hydratation) :

```typescript
// src/features/auth/components/SentryUserSync.tsx
'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

export function SentryUserSync() {
  const { user } = useCurrentUser();

  useEffect(() => {
    if (user) {
      Sentry.setUser({ id: user.internal_id, email: user.email });
    } else {
      Sentry.setUser(null);
    }
  }, [user?.internal_id]);

  return null;
}
// Monter dans le layout privé : <SentryUserSync />
```

---

## Tags sémantiques

```typescript
// Dans les Server Components ou Client Components
import * as Sentry from '@sentry/nextjs';

// Tags globaux (dans le layout privé)
Sentry.setTag('environment', process.env.NEXT_PUBLIC_APP_ENV);
Sentry.setTag('user_role', user.roles[0] ?? 'free');

// Tags opérationnels (dans les mutations SWR ou Server Actions)
Sentry.withScope((scope) => {
  scope.setTag('operation', 'animal.create');
  scope.setTag('feature', 'animals');
  Sentry.captureException(error);
});
```

---

## Breadcrumbs — actions utilisateur clés

```typescript
import * as Sentry from '@sentry/nextjs';

// Dans les hooks SWR de mutation
export function useCreateAnimal() {
  return useSWRMutation('/api/animals', async (url, { arg }) => {
    Sentry.addBreadcrumb({ category: 'animals', message: 'Creating animal', level: 'info', data: arg });
    const result = await AnimalService.create(arg);
    Sentry.addBreadcrumb({ category: 'animals', message: 'Animal created', level: 'info' });
    return result;
  });
}
```

Actions à tracer :
- Création / modification / suppression d'un animal, une note, un événement
- Navigation entre les sections principales
- Appels à l'IA
- Erreurs de formulaire répétées (plusieurs tentatives)

---

## Capture enrichie dans les routes BFF

```typescript
// src/app/api/animals/route.ts
import * as Sentry from '@sentry/nextjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await apiBack.post('/animals', body);
    return Response.json(result.data);
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag('bff_route', '/api/animals');
      scope.setTag('method', 'POST');
      scope.captureException(error);
    });
    // Propager pour que error.tsx prenne le relais
    throw error;
  }
}
```

---

## Variables d'environnement requises

```bash
# .env.local.example
NEXT_PUBLIC_SENTRY_DSN=       # DSN public (client-side)
SENTRY_DSN=                   # DSN serveur (server-side, non exposé)
NEXT_PUBLIC_APP_ENV=staging   # development | staging | production
NEXT_PUBLIC_APP_VERSION=1.0.0
APP_VERSION=1.0.0
SENTRY_ORG=mydailybook
SENTRY_PROJECT=mydailybook-web
SENTRY_AUTH_TOKEN=            # Pour l'upload des source maps (CI uniquement)
```

> Rappel doc sync : mettre à jour `.env.local.example` et `README.md` section config.

---

## Règles absolues

- `Sentry.setUser()` : **uniquement** dans `layout.tsx` serveur et `SentryUserSync.tsx` client — jamais dans les composants métier
- `tracesSampleRate` : **maximum 0.1** — la valeur actuelle de 1.0 génère du bruit et un coût excessif
- `replaysSessionSampleRate` : **maximum 0.05** — les replays sont coûteux et sensibles RGPD
- `maskAllText: true` dans le replay — conformité RGPD par défaut
- `hideSourceMaps: true` — les source maps ne doivent pas être exposées en production
- `release` : format `mydailybook-web@{version}` — permet de lier les erreurs aux déploiements
- `beforeSend` : ne jamais envoyer d'événements en `development` — pollue le dashboard
