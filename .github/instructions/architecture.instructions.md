---
applyTo: "src/**/*.ts,src/**/*.tsx"
---

# Architecture — Web MyDailyBook (Next.js 15)

## Principe directeur
**Feature-based** : tout ce qui concerne un domaine (animals, events, contacts...) est co-localisé dans `features/{domain}/`.
Les dossiers plats (`components/`, `hooks/`, `services/` à la racine de `src/`) sont à éviter — migrer vers les features.

## Structure cible par domaine

```
src/features/{domain}/
├── components/
│   ├── {Domain}Card.tsx            # Composant de présentation
│   ├── {Domain}List.tsx            # Liste avec états
│   └── {Domain}FormDrawer.tsx      # Formulaire (sheet/modal)
├── hooks/
│   ├── use{Domain}Data.ts          # SWR hook pour la donnée
│   └── use{Domain}Form.ts          # React Hook Form + Zod
├── services/
│   └── {domain}.service.ts         # Appels vers /api/{domain}
├── context/
│   └── {Domain}Context.tsx         # Provider UNIQUEMENT si partagé entre plusieurs niveaux
└── types.ts                        # Types du domaine
```

## Hooks SWR — pattern

```typescript
// src/features/animals/hooks/useAnimalsData.ts
'use client';
import useSWR from 'swr';
import { AnimalsService } from '../services/animals.service';
import type { Animal } from '../types';

export const useAnimalsData = () => {
  const { data, error, isLoading, mutate } = useSWR<Animal[]>('/api/animals', AnimalsService.getAll);
  return { animals: data ?? [], isLoading, isError: !!error, mutate };
};
```

## Services — appels BFF

```typescript
// src/features/animals/services/animals.service.ts
import { apiClient } from '@/lib/apiClient';
import type { Animal } from '../types';

export const AnimalsService = {
  getAll: () => apiClient.get<Animal[]>('/animals').then(r => r.data),
  getById: (id: number) => apiClient.get<Animal>(`/animals/${id}`).then(r => r.data),
  create: (data: Partial<Animal>) => apiClient.post<Animal>('/animals', data).then(r => r.data),
  update: (id: number, data: Partial<Animal>) => apiClient.put<Animal>(`/animals/${id}`, data).then(r => r.data),
  delete: (id: number) => apiClient.delete(`/animals/${id}`),
};
```

## API routes BFF — `app/api/{domain}/`

```typescript
// app/api/animals/route.ts  (Server Component)
import { apiBack } from '@/lib/apiBack';
import { getCurrentUser } from '@/lib/auth/server/getCurrentUser';
import { NextResponse } from 'next/server';

export async function GET() {
  const animals = await apiBack.get('/animals');
  return NextResponse.json(animals.data);
}

export async function POST(req: Request) {
  const body = await req.json();
  // Validation Zod ici
  const result = await apiBack.post('/animals', body);
  return NextResponse.json(result.data, { status: 201 });
}
```

Un fichier = un domaine. Pas de route `/api/[resource]` générique.

## Server vs Client Components

| Cas | Rendu |
|-----|-------|
| Affichage initial de données (SEO, performance) | Server Component — fetch direct via `apiBack` |
| Interactivité : formulaires, drawers, modals | `'use client'` + SWR hook |
| Layout, navigation statique | Server Component |
| Thème, dark mode | `'use client'` (next-themes) |

```typescript
// ✅ Server Component — pas de 'use client'
export default async function AnimalsPage() {
  const animals = await apiBack.get<Animal[]>('/animals').then(r => r.data);
  return <AnimalList initialAnimals={animals} />;
}

// ✅ Client Component — SWR pour les mises à jour temps réel
'use client';
export function AnimalList({ initialAnimals }: { initialAnimals: Animal[] }) {
  const { animals } = useAnimalsData(); // SWR revalide automatiquement
  return <>{animals.map(a => <AnimalCard key={a.id} animal={a} />)}</>;
}
```

## Contextes React — utilisation restreinte
- Remplacer les Contextes de données par des hooks SWR — `useAnimalsData()` vaut mieux que `AnimalContext`
- Garder un Context uniquement pour : état UI partagé entre composants distants (drawer open/close, form state d'un wizard)
- Maximum 2 niveaux de providers imbriqués dans un layout

## `components/ui/` — primitives uniquement
- Uniquement les composants Radix/shadcn génériques (Button, Card, Dialog, Input, Select...)
- Zéro logique métier dans `components/ui/`
- Les composants métier vivent dans `features/{domain}/components/`

## Types
- Types d'un domaine → `features/{domain}/types.ts`
- Types globaux partagés entre features → `src/types/`
- Types des réponses API → inclure l'envelope `ApiResponse<T>` dans `src/types/api.ts`

## Routing — App Router
```
app/
├── (public)/
│   ├── page.tsx            # Page d'accueil
│   ├── login/page.tsx
│   └── register/page.tsx
└── (private)/
    ├── layout.tsx           # Auth guard + layout principal
    ├── dashboard/page.tsx
    ├── animals/
    │   ├── page.tsx         # Liste
    │   └── [id]/page.tsx    # Détail
    └── calendar/page.tsx
```

Les pages dans `(private)/` ne font pas de vérification d'auth individuelle — c'est le rôle du `layout.tsx` parent et de `middleware.ts`.
