# 🔄 Contextes React (State Management)

## Vue d'ensemble

L'application utilise la **React Context API** pour gérer l'état global. Chaque entité métier (animaux, événements, objectifs, etc.) possède son propre contexte, ce qui permet une séparation claire des responsabilités.

Il existe **3 types de contextes** dans le projet :

| Type | Rôle | Exemple |
|---|---|---|
| **Data Context** | Stocke et gère les données d'une entité (CRUD) | `AnimalContext`, `EventContext` |
| **UI Context (Form Drawer)** | Gère l'état d'ouverture/fermeture d'un formulaire en drawer | `AnimalFormDrawerContext` |
| **UI Context (Delete)** | Gère la modale de confirmation de suppression | `AnimalDeleteContext` |

---

## Architecture

```
src/context/
├── UserContext.tsx                  # Utilisateur connecté
├── AnimalContext.tsx                # CRUD animaux
├── AnimalFormDrawerContext.tsx      # État du drawer formulaire animal
├── AnimalDeleteContext.tsx          # Modale de suppression animal
├── EventContext.tsx                 # CRUD événements
├── EventFormDrawerContext.tsx       # État du drawer formulaire événement
├── EventDrawerContext.tsx           # État du drawer détail événement
├── EventDeleteContext.tsx           # Modale de suppression événement
├── ObjectiveContext.tsx             # CRUD objectifs
├── ObjectiveFormDrawerContext.tsx   # État du drawer formulaire objectif
├── ObjectiveDeleteContext.tsx       # Modale de suppression objectif
├── NoteContext.tsx                  # CRUD notes
├── ContactContext.tsx               # CRUD contacts
├── GroupContext.tsx                  # CRUD groupes
└── WishContext.tsx                  # CRUD souhaits
```

---

## 1. Data Context (exemple : `UserContext`)

Le pattern le plus simple. Le provider wrape l'appel au hook SWR et expose les données.

```tsx
'use client';

import { createContext, useContext } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { User } from "@/types/user";

// 1. Typer le contexte
type UserContextType = {
  user: User | undefined;
  isLoading: boolean;
  isError: any;
};

// 2. Créer le contexte (valeur initiale undefined)
const UserContext = createContext<UserContextType | undefined>(undefined);

// 3. Provider : wrape le hook et expose les données
export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isError } = useCurrentUser();

  return (
    <UserContext.Provider value={{ user, isLoading, isError }}>
      {children}
    </UserContext.Provider>
  );
}

// 4. Hook consommateur avec guard
export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used within UserProvider");
  return ctx;
}
```

**Utilisation dans un composant :**

```tsx
const { user, isLoading } = useUserContext();
```

### Data Context complet (exemple : `AnimalContext`)

Pour les entités avec CRUD, le contexte est plus riche :

```tsx
type AnimalContextType = {
  animals: Animal[] | undefined;
  isLoading: boolean;
  isError: any;
  addAnimal: (animal: Partial<Animal>) => Promise<void>;
  updateAnimal: (id: number, animal: Partial<Animal>) => Promise<void>;
  deleteAnimal: (id: number) => Promise<void>;
  refresh: () => void;
};
```

Le provider :
1. Récupère les données via le hook SWR (`useAnimalsData`)
2. Enrichit les données (ex: images signées S3)
3. Expose les fonctions CRUD qui appellent les services puis revalident le cache SWR (`mutate`)

---

## 2. UI Context — Form Drawer (exemple : `AnimalFormDrawerContext`)

Gère l'état d'un drawer formulaire (ouvert/fermé, mode création/édition, données initiales).

```tsx
type DrawerState = {
  open: boolean;
  initialAnimal?: Partial<Animal>;
  isEdit?: boolean;
};

type AnimalFormDrawerContextType = {
  drawer: DrawerState;
  openDrawer: (params?: { initialAnimal?: Partial<Animal>; isEdit?: boolean }) => void;
  closeDrawer: () => void;
};
```

**Utilisation :**

```tsx
// Ouvrir le drawer en mode création
const { openDrawer } = useAnimalFormDrawer();
openDrawer({ initialAnimal: { datenaissance: '2026-01-01' } });

// Ouvrir en mode édition
openDrawer({ initialAnimal: existingAnimal, isEdit: true });

// Fermer
const { closeDrawer } = useAnimalFormDrawer();
closeDrawer();
```

---

## 3. UI Context — Delete (exemple : `AnimalDeleteContext`)

Gère la modale de confirmation de suppression. Le provider embarque directement le composant `ConfirmDialog`.

```tsx
export function AnimalDeleteProvider({ children }: { children: ReactNode }) {
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);
  const { deleteAnimal } = useAnimals();

  const openDelete = (animal: Animal) => setAnimalToDelete(animal);

  const handleConfirmDelete = async () => {
    if (animalToDelete) {
      await deleteAnimal(animalToDelete.id);
      toast.success("Animal supprimé avec succès.");
      setAnimalToDelete(null);
    }
  };

  return (
    <AnimalDeleteContext.Provider value={{ openDelete }}>
      {children}
      {/* La modale est rendue directement dans le provider */}
      <ConfirmDialog
        open={!!animalToDelete}
        title="Confirmer la suppression"
        onCancel={() => setAnimalToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </AnimalDeleteContext.Provider>
  );
}
```

**Utilisation :**

```tsx
const { openDelete } = useAnimalDelete();
openDelete(animal); // Ouvre la modale de confirmation
```

---

## Où sont montés les providers ?

### Layout privé (`src/app/(private)/layout.tsx`)

Les **Data Contexts** sont montés au niveau du layout privé, qui wrape toutes les pages authentifiées :

```tsx
export default function RootLayout({ children }) {
  return (
    <UserProvider>
      <EventProvider>
        <GroupProvider>
          <ObjectiveProvider>
            <AnimalProvider>
              <ContactProvider>
                <NoteProvider>
                  <WishProvider>
                    <PrivateLayout>
                      {children}
                    </PrivateLayout>
                  </WishProvider>
                </NoteProvider>
              </ContactProvider>
            </AnimalProvider>
          </ObjectiveProvider>
        </GroupProvider>
      </EventProvider>
    </UserProvider>
  );
}
```

### PrivateLayout (`src/components/layout/PrivateLayout.tsx`)

Les **UI Contexts** (drawers, delete modals) sont montés dans le `PrivateLayout`, qui gère aussi la navbar et le FAB :

```tsx
export function PrivateLayout({ children }) {
  return (
    <AnimalFormDrawerProvider>
      <AnimalDeleteProvider>
        <EventFormDrawerProvider>
          <EventDeleteProvider>
            <EventDrawerProvider>
              <ObjectiveFormDrawerProvider>
                <ObjectiveDeleteProvider>
                  <ResponsiveAppBar />
                  {children}
                  {/* Wrappers qui rendent les drawers / modales */}
                  <EventFormDrawerWrapper />
                  <EventDrawerWrapper />
                  <AnimalFormDrawerWrapper />
                  <ObjectiveFormDrawerWrapper />
                  <FloatingActions ... />
                </ObjectiveDeleteProvider>
              </ObjectiveFormDrawerProvider>
            </EventDrawerProvider>
          </EventDeleteProvider>
        </EventFormDrawerProvider>
      </AnimalDeleteProvider>
    </AnimalFormDrawerProvider>
  );
}
```

> 📌 Les **wrappers** (`EventFormDrawerWrapper`, etc.) consomment le contexte et rendent le composant Drawer/Dialog correspondant. Ils sont toujours montés, mais ne s'affichent que quand `drawer.open === true`.

---

## Flux complet (exemple : créer un animal)

```
1. L'utilisateur clique sur "+" dans le FAB
   → FloatingActions appelle openDrawer() du AnimalFormDrawerContext

2. Le drawer s'ouvre (AnimalFormDrawerWrapper rend le AnimalFormDrawer)
   → Le formulaire utilise useAnimalForm() pour la logique

3. L'utilisateur remplit et soumet le formulaire
   → useAnimalForm appelle addAnimal() du AnimalContext

4. AnimalContext appelle le service (services/animals.ts)
   → Le service POST vers /api/animals via apiClient

5. L'API Route forward vers le back-end via apiBack
   → Le back-end insère en base PostgreSQL

6. AnimalContext appelle mutate() pour revalider le cache SWR
   → La liste se met à jour automatiquement

7. Toast de succès + fermeture du drawer
```

---

## Bonnes pratiques

1. **Toujours utiliser le hook consommateur** (`useAnimals()`, `useUserContext()`, etc.) plutôt que `useContext()` directement — le guard lève une erreur explicite si le provider est manquant.

2. **Ne pas mélanger data et UI** dans un même contexte. Les données (CRUD) et l'état UI (drawer ouvert/fermé) sont dans des contextes séparés.

3. **Les providers wrappent uniquement les zones qui en ont besoin** : les data providers sont au niveau du layout, les UI providers dans le PrivateLayout.

4. **`'use client'`** : tous les contextes sont des Client Components (ils utilisent `useState`, `useContext`, etc.).
