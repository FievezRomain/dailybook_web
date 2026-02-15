# 🛠️ Stack technique

## Framework & Runtime

| Technologie | Version | Rôle |
|---|---|---|
| [Next.js](https://nextjs.org/) | 15.3 | Framework React full-stack (App Router, SSR, API Routes) |
| [React](https://react.dev/) | 19 | Librairie UI |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Typage statique |
| [Node.js](https://nodejs.org/) | 20 | Runtime (build + prod) |

---

## UI & Styling

| Technologie | Rôle |
|---|---|
| [Tailwind CSS](https://tailwindcss.com/) v4 | Classes utilitaires CSS |
| [shadcn/ui](https://ui.shadcn.com/) | Composants UI accessibles (Radix + Tailwind) |
| [Radix UI](https://www.radix-ui.com/) | Primitives headless (Dialog, Dropdown, Select, Popover, etc.) |
| [Lucide React](https://lucide.dev/) | Icônes |
| [SASS / SCSS Modules](https://sass-lang.com/) | Styles complexes (layouts, grilles) |
| [tw-animate-css](https://github.com/nicholasgasior/tw-animate-css) | Animations Tailwind |
| [class-variance-authority](https://cva.style/) | Gestion de variantes de composants |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Fusion intelligente de classes Tailwind |
| [clsx](https://github.com/lukeed/clsx) | Concaténation conditionnelle de classes |

---

## Authentification & Sécurité

| Technologie | Rôle |
|---|---|
| [Firebase Auth](https://firebase.google.com/docs/auth) (client) | Inscription, connexion, vérification e-mail |
| [Firebase Admin](https://firebase.google.com/docs/admin/setup) (server) | Vérification de token dans le middleware |
| Cookie de session HTTP-only | Stockage sécurisé du token côté serveur |
| Middleware Next.js | Protection des routes privées |

---

## Data Fetching & State

| Technologie | Rôle |
|---|---|
| [SWR](https://swr.vercel.app/) | Fetching déclaratif, cache, revalidation |
| [Axios](https://axios-http.com/) | Client HTTP (intercepteurs, timeout) |
| React Context API | État global par entité (animaux, événements, objectifs, etc.) |

---

## Calendrier & Visualisation

| Technologie | Rôle |
|---|---|
| [FullCalendar](https://fullcalendar.io/) | Calendrier interactif (vue mois) |
| [react-day-picker](https://react-day-picker.js.org/) | Sélecteur de date |
| [react-calendar](https://www.npmjs.com/package/react-calendar) | Mini calendrier |
| [Embla Carousel](https://www.embla-carousel.com/) | Carousel (composant shadcn) |
| [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout) | Dashboard avec cartes draggables |

---

## Monitoring & Qualité

| Technologie | Rôle |
|---|---|
| [Sentry](https://sentry.io/) | Monitoring d'erreurs (production) |
| [ESLint](https://eslint.org/) | Linting du code |
| [next/core-web-vitals](https://nextjs.org/docs/messages/core-web-vitals) | Règles ESLint Next.js |

---

## Infrastructure & Déploiement

| Technologie | Rôle |
|---|---|
| [Docker](https://www.docker.com/) | Conteneurisation du front (Dockerfile multi-stage) |
| [Docker Compose](https://docs.docker.com/compose/) | Orchestration dev (PostgreSQL) et prod |
| Next.js `standalone` output | Build optimisé pour Docker (minimal footprint) |

---

## Theming

| Technologie | Rôle |
|---|---|
| [next-themes](https://github.com/pacocoursey/next-themes) | Gestion dark/light mode |
| Variables CSS custom | Palette de couleurs (baie, alezan, isabelle, rouan, etc.) |
| [Google Fonts – Quicksand](https://fonts.google.com/specimen/Quicksand) | Police principale |

---

## Notifications

| Technologie | Rôle |
|---|---|
| [Sonner](https://sonner.emilkowal.dev/) | Toasts / notifications |
| [Vaul](https://vaul.emilkowal.dev/) | Drawer mobile-first |
