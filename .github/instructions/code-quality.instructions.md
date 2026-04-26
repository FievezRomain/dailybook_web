---
applyTo: "src/**/*.ts,src/**/*.tsx"
---

# Qualité du code — Web MyDailyBook (Next.js)

## TypeScript

- Mode strict : pas de `any` sans commentaire justificatif `// eslint-disable-next-line @typescript-eslint/no-explicit-any — raison`
- Pas d'`as` (type assertion) sans vérification runtime préalable
- Types explicites sur les props de composants, retours de fonctions publiques, et les paramètres
- Pas de `!` (non-null assertion) sans garantie — préférer l'optional chaining `?.`
- Préférer `type` à `interface` sauf pour les objets extensibles (ex: props composant)

## Taille et cohésion des fichiers

- Composant : max ~150 lignes. Au-delà, extraire un sous-composant
- Hook : max ~100 lignes. Au-delà, découper en hooks plus petits
- Route API BFF : max ~80 lignes. Une route = un domaine
- Fichiers de types : regrouper par domaine dans `features/{domain}/types.ts`

## Server vs Client — discipline stricte

- Pas de `'use client'` sans raison explicite documentée en commentaire
- Les Server Components ne reçoivent jamais de fonctions comme props
- Les données fetchées côté serveur ne sont jamais re-fetchées côté client pour la même vue
- `lib/firebase-admin.ts` : **jamais importé dans un Client Component ou une barrel export**

## Nommage

- Composants : `PascalCase` — `AnimalCard`, `EventFormDrawer`
- Hooks : `camelCase` préfixé `use` — `useAnimalForm`, `useEventList`
- Route handlers : fichiers `route.ts` uniquement — pas de logique métier dedans
- Constants : `SCREAMING_SNAKE_CASE` pour les constantes globales
- Types/Interfaces : `PascalCase`

## Imports

- Ordre : React/Next → librairies tierces → modules internes (par profondeur décroissante) → types
- Pas d'imports relatifs profonds (`../../..`) — utiliser les alias `@/` configurés dans `tsconfig.json`
- Pas d'import de barrel (`index.ts`) sauf pour les exports publics d'une feature

## Composants purs

- Un composant ne déclenche pas de side-effects directement — déléguer à un hook ou un Server Action
- Les callbacks (`onClick`, `onChange`) sont passés en props, jamais hardcodés dans le composant
- Éviter le props drilling > 2 niveaux — utiliser SWR shared hook ou un contexte lean

## Gestion d'erreurs

- Les erreurs SWR sont gérées au niveau du hook (retour `isError`, `error`)
- Les Server Components utilisent `error.tsx` pour les erreurs non gérées
- Ne pas swallower les erreurs avec un `catch` vide
- `console.error` uniquement en développement — utiliser le logger en production

## Dead code

- Pas de code commenté en dehors des `// TODO:` liés à une issue
- Pas de `console.log` en production — conditionner avec `process.env.NODE_ENV === 'development'`
- Supprimer les imports inutilisés (ESLint le détecte automatiquement)

## Synchronisation docs & config — règle obligatoire

Toute modification qui impacte l'un des éléments suivants **doit être accompagnée** d'une mise à jour dans le **même commit** :

| Modification | Fichiers à mettre à jour |
|-------------|--------------------------|
| Ajout / suppression d'une dépendance | `package.json`, `README.md` section stack |
| Nouvelle route API BFF (`app/api/`) | `docs/api-services.md`, `README.md` si route publique |
| Nouveau domaine ou nouvelle feature | `docs/architecture.md`, `README.md` si visible |
| Nouvelle variable d'environnement | `.env.local.example`, `README.md` section config |
| Nouveau middleware ou protection de route | `docs/authentication.md` |
| Changement du système de thème ou tokens | `docs/tailwind-colors.md` ou équivalent |
| Nouvelle intégration Firebase / externe | `docs/stack.md`, `docs/authentication.md` si auth |

### Checklist commit "breaking change config"
```
[ ] package.json à jour
[ ] next.config.ts à jour si plugin/config impacté
[ ] docs/api-services.md à jour si nouvelle route BFF
[ ] docs/architecture.md à jour si nouveau domaine
[ ] .env.local.example à jour si nouvelle variable
[ ] README.md reflète l'état actuel
```

### Règle pour Copilot
Quand tu génères du code qui :
- Crée une nouvelle route `app/api/` → **rappeler de mettre à jour `docs/api-services.md`**
- Crée un nouveau domaine dans `features/` → **rappeler de mettre à jour `docs/architecture.md`**
- Ajoute une variable d'environnement → **rappeler de mettre à jour `.env.local.example`**
- Modifie `middleware.ts` → **rappeler de mettre à jour `docs/authentication.md`**
- Ajoute une lib → **rappeler de vérifier la compatibilité App Router et mettre à jour `README.md`**
