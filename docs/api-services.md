# 🔗 API & Services

## Architecture de communication

L'application utilise un **pattern proxy** : le front-end ne communique jamais directement avec le back-end Node.js. Toutes les requêtes passent par les **API Routes Next.js**.

```
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────┐
│  React Client   │──────▶│  API Routes Next.js  │──────▶│  Back-end Node  │
│  (Browser)      │  /api │  (Server-side)       │  HTTP │  (Express)      │
└─────────────────┘       └──────────────────────┘       └─────────────────┘
                                                                  │
                                                                  ▼
                                                         ┌─────────────────┐
                                                         │   PostgreSQL    │
                                                         └─────────────────┘
```

---

## Les 3 couches HTTP

### 1. `apiClient.ts` — Client → API Routes

Instance Axios configurée pour appeler les API Routes internes (`/api/*`).

```typescript
const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000,
});
```

- Utilisé dans les fichiers `services/*.ts`.
- Envoie automatiquement les cookies (session).

### 2. `axios.ts` — Client → Back-end (direct, legacy)

Instance Axios configurée pour appeler le back-end directement (utilisé dans certains cas).

```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'x-client': 'web' },
});
```

- Intercepteur de requête : ajoute automatiquement le token depuis le cookie.
- Intercepteur de réponse : auto-logout sur `401`.

### 3. `apiBack.ts` — API Routes → Back-end

Fonction server-side utilisée dans les API Routes pour forward les requêtes vers le back-end.

```typescript
export async function apiBack(path, method, data?) {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  // Forward vers NEXT_PUBLIC_API_URL avec le token
}
```

- Lit le cookie de session côté serveur.
- Ajoute le header `x-access-token`.

---

## Services (client-side)

Les services sont dans `src/services/`. Chaque fichier correspond à une entité métier et expose des fonctions CRUD.

| Fichier | Entité | Endpoints |
|---|---|---|
| `animals.ts` | Animaux | GET, POST, PUT, DELETE `/api/animals` |
| `events.ts` | Événements | GET, POST, PUT, DELETE `/api/events` |
| `objectifs.ts` | Objectifs | GET, POST, PUT, DELETE `/api/objectives` |
| `notes.ts` | Notes | GET, POST, PUT, DELETE `/api/notes` |
| `contacts.ts` | Contacts | GET, POST, PUT, DELETE `/api/contacts` |
| `groups.ts` | Groupes | GET, POST, PUT, DELETE `/api/groups` |
| `wishs.ts` | Souhaits | GET, POST, PUT, DELETE `/api/wishes` |
| `user.ts` | Utilisateur | GET, PUT `/api/user` |
| `user_picture.ts` | Photo de profil | GET, POST `/api/user/picture` |
| `storage.ts` | Fichiers S3 | GET, POST, DELETE `/api/storage` |

### Exemple d'utilisation

```typescript
// services/animals.ts
import apiClient from '@/lib/apiClient';

export async function getAnimals() {
  const { data } = await apiClient.get('/animals');
  return data;
}

export async function createAnimal(animal: AnimalCreate) {
  const { data } = await apiClient.post('/animals', animal);
  return data;
}
```

---

## API Routes (server-side)

Les API Routes sont dans `src/app/api/`. Elles servent de **proxy sécurisé** entre le client et le back-end.

```
src/app/api/
├── animals/          # Proxy CRUD animaux
├── contacts/         # Proxy CRUD contacts
├── events/           # Proxy CRUD événements
├── groups/           # Proxy CRUD groupes
├── notes/            # Proxy CRUD notes
├── objectives/       # Proxy CRUD objectifs
├── wishes/           # Proxy CRUD souhaits
├── me/               # Info utilisateur courant
├── user/             # Gestion utilisateur
├── storage/          # Upload / gestion fichiers S3
└── session/
    ├── login/        # Création du cookie de session
    └── logout/       # Suppression du cookie de session
```

### Pourquoi un proxy ?

1. **Sécurité** : le token n'est jamais exposé côté client (stocké dans un cookie HTTP-only).
2. **Abstraction** : le client n'a pas besoin de connaître l'URL du back-end.
3. **Flexibilité** : on peut ajouter de la logique server-side (validation, transformation, cache) sans toucher au back-end.

---

## Hooks de données (SWR)

Les hooks dans `src/hooks/` encapsulent le fetching + la mise en cache avec **SWR**.

| Hook | Service utilisé | Données |
|---|---|---|
| `useAnimalsData` | `animals.ts` | Liste des animaux |
| `useEventsData` | `events.ts` | Liste des événements |
| `useObjectivesData` | `objectifs.ts` | Liste des objectifs |
| `useNotesData` | `notes.ts` | Liste des notes |
| `useContactsData` | `contacts.ts` | Liste des contacts |
| `useGroupsData` | `groups.ts` | Liste des groupes |
| `useWishsData` | `wishs.ts` | Liste des souhaits |
| `useCurrentUser` | `user.ts` | Utilisateur connecté |

### Pattern type

```typescript
import useSWR from 'swr';
import { getAnimals } from '@/services/animals';

export function useAnimalsData() {
  const { data, error, isLoading, mutate } = useSWR('animals', getAnimals);

  return {
    animals: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
```

---

## Hooks de formulaires

Les hooks `useAnimalForm`, `useEventForm`, `useObjectiveForm` encapsulent la logique de création/édition :

- Gestion du state du formulaire
- Validation
- Appel au service approprié (create / update)
- Revalidation SWR après mutation
- Gestion des erreurs
