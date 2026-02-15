# 🏗️ Architecture du projet

## Vue d'ensemble

L'application **Vasco and co** est une Single Page Application (SPA) construite avec **Next.js 15** (App Router). Elle utilise un pattern **client/serveur hybride** : certaines routes sont des Server Components (layout, pages), d'autres des Client Components (formulaires, interactions).

---

## Arborescence des dossiers

```
src/
├── app/                          # App Router Next.js
│   ├── globals.css               # Styles globaux + variables CSS (thème)
│   ├── layout.tsx                # Layout racine (html, body, font, Sentry, ClientRoot)
│   │
│   ├── (public)/                 # Route group — pages accessibles sans auth
│   │   ├── layout.tsx            # Layout public (minimal)
│   │   ├── page.tsx              # Page d'accueil / landing
│   │   ├── login/                # Page de connexion
│   │   ├── register/             # Page d'inscription
│   │   └── verify-email/         # Page de vérification d'e-mail
│   │
│   ├── (private)/                # Route group — pages protégées (auth requise)
│   │   ├── layout.tsx            # Layout privé (providers, sidebar, navbar)
│   │   ├── dashboard/            # Tableau de bord
│   │   ├── animals/              # Gestion des animaux
│   │   ├── calendar/             # Calendrier des événements
│   │   ├── performances/         # Objectifs & performances
│   │   │   └── objectives/
│   │   └── profil/               # Profil utilisateur
│   │
│   └── api/                      # API Routes (Server-side)
│       ├── animals/              # CRUD animaux (proxy vers le back)
│       ├── contacts/             # CRUD contacts
│       ├── events/               # CRUD événements
│       ├── groups/               # CRUD groupes
│       ├── notes/                # CRUD notes
│       ├── objectives/           # CRUD objectifs
│       ├── wishes/               # CRUD souhaits
│       ├── me/                   # Info utilisateur courant
│       ├── user/                 # Gestion utilisateur
│       ├── storage/              # Upload / gestion fichiers S3
│       └── session/              # Login / Logout (cookie session)
│
├── components/                   # Composants React réutilisables
│   ├── ui/                       # Composants shadcn/ui (Button, Dialog, Drawer, etc.)
│   ├── layout/                   # PrivateLayout (sidebar + navbar)
│   ├── animals/                  # Composants liés aux animaux
│   ├── events/                   # Composants liés aux événements
│   ├── objectives/               # Composants liés aux objectifs
│   ├── dashboard/                # Cartes du dashboard (GridCards)
│   ├── ModeToggle.tsx            # Bascule dark/light mode
│   ├── ResponsiveAppBar.tsx      # Barre de navigation responsive
│   └── UserButton.tsx            # Bouton utilisateur (avatar, menu)
│
├── context/                      # React Context Providers
│   ├── UserContext.tsx            # Utilisateur connecté
│   ├── AnimalContext.tsx          # Liste des animaux
│   ├── EventContext.tsx           # Liste des événements
│   ├── ObjectiveContext.tsx       # Liste des objectifs
│   ├── NoteContext.tsx            # Liste des notes
│   ├── GroupContext.tsx           # Groupes
│   ├── ContactContext.tsx         # Contacts
│   ├── WishContext.tsx            # Souhaits
│   └── *DeleteContext / *FormDrawerContext  # États UI (modales, drawers)
│
├── hooks/                        # Custom React Hooks
│   ├── useCurrentUser.ts         # Hook pour l'utilisateur courant
│   ├── useAnimalsData.ts         # Fetching + cache SWR pour les animaux
│   ├── useEventsData.ts          # Fetching + cache SWR pour les événements
│   ├── useObjectivesData.ts      # Fetching + cache SWR pour les objectifs
│   ├── useAnimalForm.ts          # Logique formulaire animal
│   ├── useEventForm.ts           # Logique formulaire événement
│   ├── useObjectiveForm.ts       # Logique formulaire objectif
│   └── ...                       # Autres hooks data (contacts, notes, groups, wishs)
│
├── services/                     # Couche service (appels API client-side)
│   ├── animals.ts
│   ├── events.ts
│   ├── objectifs.ts
│   ├── notes.ts
│   ├── contacts.ts
│   ├── groups.ts
│   ├── wishs.ts
│   ├── user.ts
│   ├── user_picture.ts
│   └── storage.ts
│
├── lib/                          # Librairies & utilitaires bas-niveau
│   ├── firebase.ts               # Config Firebase (client-side)
│   ├── firebase-admin.ts         # Config Firebase Admin (server-side)
│   ├── firebaseService.ts        # Helpers Firebase (signIn, register, verifyEmail, etc.)
│   ├── axios.ts                  # Instance Axios client (intercepteurs, cookie token)
│   ├── apiBack.ts                # Helper fetch server-side (cookie → back-end)
│   ├── apiClient.ts              # Instance Axios pour les API Routes internes
│   ├── utils.ts                  # Utilitaires shadcn (cn, etc.)
│   └── auth/                     # (réservé, à compléter)
│
├── types/                        # Types TypeScript
│   ├── animal.ts
│   ├── event.ts
│   ├── objective.ts
│   ├── note.ts
│   ├── contact.ts
│   ├── group.ts
│   ├── user.ts
│   ├── wish.ts
│   ├── image.ts
│   └── user_picture.ts
│
├── utils/                        # Utilitaires métier
│   ├── animalsUtils.ts
│   ├── eventsUtils.ts
│   ├── goalsUtils.ts
│   ├── datesUtils.ts
│   ├── apiUtils.ts
│   └── s3Utils.ts
│
├── styles/                       # Fichiers SCSS
│   ├── base/                     # Variables & mixins SCSS globaux
│   │   ├── _variables.scss
│   │   └── _mixins.scss
│   ├── components/               # Styles spécifiques aux composants
│   │   └── dashboard.module.scss
│   └── pages/                    # Styles spécifiques aux pages
│       ├── login.module.scss
│       ├── register.module.scss
│       ├── dashboard.module.scss
│       ├── calendar.css
│       └── welcome.module.scss
│
├── theme/                        # Configuration du thème
│   └── fonts.ts                  # Police Quicksand (Google Fonts)
│
├── constants/                    # Constantes globales
│   └── cookies.ts                # Nom du cookie de session
│
└── features/                     # Feature modules (réservé, à compléter)
    └── auth/
```

---

## Patterns & conventions

### Route Groups

Next.js App Router utilise des **Route Groups** `(public)` et `(private)` :

- `(public)` : pages accessibles sans authentification (login, register, verify-email)
- `(private)` : pages protégées par le middleware d'authentification

Le middleware (`middleware.ts` à la racine) intercepte les requêtes et vérifie le token Firebase dans le cookie de session.

### Couche API (proxy pattern)

Le front **ne communique jamais directement avec le back-end**. Il passe par les **API Routes Next.js** (`src/app/api/`) qui servent de proxy :

```
Client (React) → API Route Next.js → Back-end Node.js → PostgreSQL
```

Côté client, les `services/` appellent les API Routes via `apiClient.ts` (Axios, base `/api`).
Côté serveur (API Routes), `apiBack.ts` forward les requêtes vers le back-end avec le token extrait du cookie.

### State Management

- **Context API** : un provider par entité métier (Animal, Event, Objective, Note, etc.)
- **SWR** : utilisé dans les hooks (`useAnimalsData`, `useEventsData`, etc.) pour le cache, la revalidation et le fetching déclaratif
- **UI State** : des contextes dédiés pour les drawers et modales de suppression (`*FormDrawerContext`, `*DeleteContext`)

### Composants UI

- **shadcn/ui** (style `new-york`) : composants de base (Button, Dialog, Drawer, Sheet, Select, etc.)
- **Tailwind CSS 4** : classes utilitaires pour le layout et le responsive
- **SCSS Modules** : utilisés uniquement pour les layouts complexes (login, dashboard grid)
- **Lucide React** : icônes

### Thème & Design System

- Police : **Quicksand** (Google Fonts)
- Palette de couleurs inspirée des robes de chevaux (baie, alezan, isabelle, rouan, aubère)
- Variables CSS dans `globals.css` (light + dark mode)
- Dark mode via `next-themes` (classe `dark` sur `<html>`)
