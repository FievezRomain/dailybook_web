# 🧩 Composants & Next.js

## Fonctionnement de Next.js (App Router)

### Server Components vs Client Components

Next.js 15 utilise l'**App Router** avec les **React Server Components** (RSC) par défaut.

| Type | Rendu | Utilisation |
|---|---|---|
| **Server Component** (défaut) | Rendu côté serveur | Layouts, pages, fetching de données |
| **Client Component** (`'use client'`) | Rendu côté client (navigateur) | Interactivité, hooks React (`useState`, `useEffect`, etc.) |

> Par défaut, tout fichier dans `src/app/` est un Server Component. Pour en faire un Client Component, ajouter `'use client'` en première ligne.

```tsx
// Server Component (par défaut) — peut fetch des données côté serveur
export default function DashboardPage() {
  return <DashboardContent />;
}
```

```tsx
// Client Component — utilise des hooks React
'use client';
export default function DashboardContent() {
  const [count, setCount] = useState(0);
  // ...
}
```

### Route Groups

L'App Router utilise des **Route Groups** (dossiers entre parenthèses) qui n'affectent pas l'URL :

```
src/app/
├── (public)/          → URL: /login, /register (pas de /public/ dans l'URL)
│   ├── login/
│   └── register/
├── (private)/         → URL: /dashboard, /animals (pas de /private/ dans l'URL)
│   ├── dashboard/
│   └── animals/
```

Chaque route group peut avoir son propre `layout.tsx`, ce qui permet d'appliquer des layouts différents selon que l'utilisateur est authentifié ou non.

### Layouts

Les layouts sont des composants qui **wrappent** les pages enfants. Ils sont **persistants** : ils ne se re-renderent pas lors de la navigation entre pages du même groupe.

```
layout.tsx (racine)          → HTML, body, police, thème, Sentry
├── (public)/layout.tsx      → Layout minimal (juste {children})
└── (private)/layout.tsx     → Providers data + PrivateLayout (navbar, sidebar, FAB)
```

### API Routes

Les fichiers dans `src/app/api/` sont des **Route Handlers** côté serveur. Ils fonctionnent comme des endpoints REST :

```tsx
// src/app/api/animals/route.ts
export async function GET(req: NextRequest) {
  const data = await apiBack('animals');
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = await apiBack('animals', 'POST', body);
  return NextResponse.json(data);
}
```

---

## Organisation des composants

```
src/components/
├── ui/                    # Composants génériques (design system)
├── layout/                # Layout de l'app (PrivateLayout)
├── animals/               # Composants métier — animaux
├── events/                # Composants métier — événements
├── objectives/            # Composants métier — objectifs
├── dashboard/             # Composants métier — dashboard
├── ModeToggle.tsx         # Bascule dark/light mode
├── ResponsiveAppBar.tsx   # Barre de navigation
└── UserButton.tsx         # Bouton utilisateur (avatar + menu)
```

---

## Composants UI génériques (`src/components/ui/`)

### Composants shadcn/ui

Ces composants proviennent de [shadcn/ui](https://ui.shadcn.com) et sont installés localement (pas une dépendance npm). Ils utilisent **Radix UI** pour l'accessibilité et **Tailwind CSS** pour le style.

| Composant | Fichier | Base Radix | Usage |
|---|---|---|---|
| `Button` | `button.tsx` | `@radix-ui/react-slot` | Boutons (variants : default, destructive, outline, secondary, ghost, link) |
| `Avatar` | `avatar.tsx` | `@radix-ui/react-avatar` | Photos de profil, avatars animaux |
| `Dialog` | `dialog.tsx` | `@radix-ui/react-dialog` | Modales |
| `Drawer` | `drawer.tsx` | `vaul` | Panneaux latéraux (formulaires) |
| `Sheet` | `sheet.tsx` | `@radix-ui/react-dialog` | Panneaux latéraux (navigation mobile) |
| `DropdownMenu` | `dropdown-menu.tsx` | `@radix-ui/react-dropdown-menu` | Menus déroulants |
| `Select` | `select.tsx` | `@radix-ui/react-select` | Sélecteurs |
| `Popover` | `popover.tsx` | `@radix-ui/react-popover` | Popovers (FAB, filtres) |
| `Input` | `input.tsx` | — | Champs de saisie |
| `Textarea` | `textarea.tsx` | — | Zones de texte |
| `Card` | `card.tsx` | — | Cartes (dashboard, fiches) |
| `Carousel` | `carousel.tsx` | `embla-carousel-react` | Carrousels d'images |
| `Calendar` | `calendar.tsx` | `react-day-picker` | Sélecteur de date |
| `Progress` | `progress.tsx` | `@radix-ui/react-progress` | Barres de progression |
| `Skeleton` | `skeleton.tsx` | — | Placeholders de chargement |
| `NavigationMenu` | `navigation-menu.tsx` | `@radix-ui/react-navigation-menu` | Menu principal |

### Barrel export

Les composants les plus utilisés sont ré-exportés via `src/components/ui/index.ts` :

```typescript
export * from "./button"
export * from "./avatar"
export * from "./dropdown-menu"
export * from "./sheet"
```

Import simplifié :

```tsx
import { Button, Avatar, Sheet } from '@/components/ui';
```

### Composants custom

En plus des composants shadcn, le projet contient des composants UI custom :

| Composant | Fichier | Rôle |
|---|---|---|
| `ClientRoot` | `ClientRoot.tsx` | Wrapper racine client (ThemeProvider, ErrorBoundary, Toaster) |
| `ErrorBoundary` | `ErrorBoundary.tsx` | Capture les erreurs React, les envoie à Sentry |
| `ConfirmDialog` | `ConfirmDialog.tsx` | Modale de confirmation générique (suppression, etc.) |
| `FloatingActions` | `FloatingActions.tsx` | Bouton "+" flottant avec menu d'actions rapides |
| `SignedImage` | `SignedImage.tsx` | Image avec URL pré-signée S3 (gestion expiration, fallback, skeleton) |
| `AnimalSelector` | `AnimalSelector.tsx` | Sélecteur d'animaux avec avatars circulaires |
| `StarRating` | `StarRating.tsx` | Notation par étoiles (1 à 5) |
| `CustomCheckbox` | `CustomCheckbox.tsx` | Checkbox stylisée (objectifs complétés) |
| `ModeToggle` | `ModeToggle.tsx` | Bouton bascule dark/light mode |

---

## Pattern des composants métier

Chaque module métier (animaux, événements, objectifs) suit le même pattern :

```
components/animals/
├── AnimalAvatar.tsx               # Affichage de l'avatar
├── AnimalGeneralCard.tsx          # Carte "infos générales"
├── AnimalHealthCard.tsx           # Carte "santé"
├── AnimalPhysicalCard.tsx         # Carte "physique"
├── AnimalEvolutionCard.tsx        # Carte "évolution"
├── AnimalFormDrawer.tsx           # Formulaire (drawer) de création/édition
└── AnimalFormDrawerWrapper.tsx    # Wrapper qui connecte le drawer au contexte
```

### Le pattern Wrapper

Les **Wrappers** sont le lien entre un composant UI et son contexte :

```tsx
// AnimalFormDrawerWrapper.tsx
export function AnimalFormDrawerWrapper() {
  const { drawer, closeDrawer } = useAnimalFormDrawer();
  
  // Ne rend rien si le drawer est fermé
  if (!drawer.open) return null;

  return (
    <AnimalFormDrawer
      initialAnimal={drawer.initialAnimal}
      isEdit={drawer.isEdit}
      onClose={closeDrawer}
    />
  );
}
```

Le wrapper est monté **une seule fois** dans le `PrivateLayout`. Quand un composant appelle `openDrawer()`, le wrapper détecte le changement d'état et rend le drawer.

---

## Composant `ClientRoot`

Point d'entrée client de l'application, monté dans le layout racine :

```tsx
export default function ClientRoot({ children }) {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Toaster />
        {children}
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

Il fournit :
1. **ErrorBoundary** : capture toutes les erreurs React non catchées → Sentry
2. **ThemeProvider** : gestion dark/light mode via `next-themes`
3. **Toaster** : système de notifications (Sonner)

---

## Convention de nommage

| Pattern | Exemple | Quand l'utiliser |
|---|---|---|
| `PascalCase` | `AnimalFormDrawer.tsx` | Tous les composants React |
| `*Content.tsx` | `DashboardContent.tsx` | Composant client principal d'une page |
| `*Card.tsx` | `AnimalHealthCard.tsx` | Carte d'information |
| `*List.tsx` | `EventList.tsx` | Liste d'éléments |
| `*Drawer.tsx` | `EventFormDrawer.tsx` | Formulaire ou détail en drawer |
| `*Wrapper.tsx` | `EventFormDrawerWrapper.tsx` | Connecte un composant à son contexte |
| `*Selector.tsx` | `AnimalSelector.tsx` | Composant de sélection |

---

## Flux de rendu d'une page (exemple : `/dashboard`)

```
1. Requête HTTP vers /dashboard

2. Middleware (middleware.ts)
   → Vérifie le cookie de session
   → Si invalide → redirect /login
   → Si valide → continue

3. Layout racine (app/layout.tsx) — Server Component
   → Rend <html>, <body>, police Quicksand
   → Monte ClientRoot (ThemeProvider, ErrorBoundary, Toaster)

4. Layout privé (app/(private)/layout.tsx) — Server Component
   → Monte tous les Data Providers (User, Animal, Event, etc.)
   → Monte PrivateLayout

5. PrivateLayout — Client Component
   → Monte les UI Providers (FormDrawer, Delete)
   → Rend ResponsiveAppBar + FloatingActions
   → Rend {children}

6. Page dashboard (app/(private)/dashboard/page.tsx) — Server Component
   → Rend <DashboardContent />

7. DashboardContent — Client Component
   → Utilise les contextes (useAnimals, useEvents, etc.)
   → Rend les cartes du dashboard avec react-grid-layout
```
