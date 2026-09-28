# MyDailyBook — Web (Next.js / React)

## Contexte
Application web de journal personnel à thématique équestre. Interface publique et espace privé.
Application critique : sécurité, performance SSR et UX moderne sont des priorités.

## Stack exact
- Next.js 15.3 + React 19 — App Router, Server Components par défaut
- TypeScript 5 (strict mode)
- Tailwind CSS 4 + shadcn/ui (primitives Radix UI)
- SWR 2 — data fetching côté client
- Firebase 11 (auth client) + firebase-admin 13 (vérification serveur)
- Axios — HTTP via `src/lib/apiClient.ts` (client) et `src/lib/apiBack.ts` (serveur)
- next-themes — dark mode
- Zod — validation formulaires et inputs

## Architecture feature-based (cible)

```
src/
├── app/
│   ├── (public)/            # login, register, verify-email
│   ├── (private)/           # dashboard, animals, calendar...
│   │   └── layout.tsx       # layout avec auth check
│   └── api/                 # BFF routes — proxy vers le backend
├── features/
│   └── {domain}/            # animals, events, contacts, notes...
│       ├── components/      # Composants UI du domaine
│       ├── hooks/           # useAnimalsData, useAnimalForm...
│       ├── services/        # appels vers /api/{domain}
│       ├── context/         # Provider si état partagé nécessaire
│       └── types.ts         # Types du domaine
├── components/
│   └── ui/                  # Primitives Radix/shadcn UNIQUEMENT (sans logique métier)
├── lib/
│   ├── firebase.ts          # Firebase client (seul point d'import firebase/auth)
│   ├── firebase-admin.ts    # Firebase Admin (server-side uniquement)
│   ├── apiClient.ts         # Axios instance client → /api/*
│   ├── apiBack.ts           # Axios instance serveur → backend avec token
│   └── auth/server/         # withAuthPage, getCurrentUser (server-side)
├── theme/
│   └── tokens.ts            # Design tokens centralisés (source unique de vérité)
├── constants/
├── types/                   # Types globaux partagés entre features
└── utils/
```

## Règles fondamentales

### Server vs Client Components
- **Server Component par défaut** — pas de `'use client'` sans raison explicite
- `'use client'` uniquement si : hooks React, event listeners, state local, SWR, animations
- Les Server Components fetchent directement via `lib/apiBack.ts` avec le token serveur
- Les Client Components utilisent SWR avec les services de `features/{domain}/services/`

### Data fetching
- Côté serveur (RSC) : `lib/apiBack.ts` directement dans le composant async
- Côté client : SWR via un hook custom dans `features/{domain}/hooks/`
- JAMAIS `useEffect` + `fetch` directement dans un composant

### Features
- Chaque feature est autonome : composants, hooks, services, types dans `features/{domain}/`
- Les contexts React ne sont créés que si l'état est partagé entre plusieurs composants non adjacents
- Préférer le hook SWR partagé (`useAnimalsData()`) à un context provider quand c'est possible

### API BFF (`app/api/`)
- Les routes `/api/*` sont le seul proxy vers le backend — les composants n'appellent JAMAIS le backend directement
- Le token Firebase est injecté côté serveur dans `lib/apiBack.ts` via le cookie session
- Une route API = un domaine = un fichier (ex: `app/api/animals/route.ts`)

### Authentification
- Firebase client encapsulé dans `lib/firebase.ts` uniquement
- Firebase Admin uniquement dans `lib/firebase-admin.ts` (jamais dans les composants)
- Session cookie géré par `app/api/session/` (login/logout)
- Protection des routes : `middleware.ts` vérifie le cookie session et redirige vers `/login`

### Design système
- TOUJOURS via `theme/tokens.ts` — les valeurs brutes CSS ne sont référencées qu'à un seul endroit
- Variables CSS sémantiques dans `globals.css` : `--color-primary`, `--font-body`...
- Tailwind consomme les variables CSS — jamais de valeur hardcodée dans les classes Tailwind
- `useAppTheme()` hook pour accéder aux tokens dans les composants client

## Anti-patterns
- `fetch()` ou `axios` dans les composants (hors `lib/`) → NON
- `import { getAuth } from 'firebase/auth'` dans les composants → NON (passer par `lib/firebase.ts`)
- Couleurs hardcodées `text-[#956540]` ou `bg-red-500` sans variable CSS → NON
- `dangerouslySetInnerHTML` sans sanitisation DOMPurify → NON
- URLs S3 construites côté client → NON (passer par `/api/storage`)
- Plus de 3 niveaux de context providers imbriqués → NON (refactorer avec SWR ou Zustand)
