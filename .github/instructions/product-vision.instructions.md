---
applyTo: "src/**/*.ts,src/**/*.tsx"
---

# MyDailyBook — Product Vision (Web / Next.js)

## Positionnement produit

MyDailyBook est un **journal de vie équestre** avec deux segments :
- **Grand public** : propriétaires de chevaux, cavaliers, passionnés
- **Semi-pro / Pro** : moniteurs, éleveurs, gestionnaires d'écurie

L'interface web cible prioritairement le **mode dashboard / gestion** — consultation avancée, statistiques, exports — là où le mobile excelle sur la saisie terrain.

---

## Rôles et RBAC

### Définition des rôles
```
free       — accès limité (quota notes, 1 animal)
premium    — accès complet mono-profil
pro        — multi-animaux, stats avancées, IA
manager    — gestion d'une structure (écurie, club)
admin      — administration transverse
```

### Règles d'implémentation côté web

- Le token Firebase contient les **custom claims** : `{ internal_id: UUID, roles: string[] }`
- Accéder aux rôles via `useCurrentUser()` qui expose `.roles: string[]` et `hasRole(role): boolean`

```tsx
// ✅ Correct — rendu conditionnel avec prompt upgrade
const { hasRole } = useCurrentUser();
if (!hasRole('premium')) return <UpgradePrompt feature="statistics" />;

// ✅ Correct — protection côté serveur (RSC)
const user = await getCurrentUser(); // lib/auth/server/
if (!user.roles.includes('pro')) redirect('/upgrade');

// ❌ Interdit
if (user.plan === 'premium') ...  // le champ 'plan' n'existe pas
```

- La **vérification serveur** (middleware + RSC) est la source de vérité sécurité
- La **vérification client** (hooks) est uniquement pour l'UX (masquer/afficher UI)
- `middleware.ts` vérifie le cookie session **et** les rôles pour les routes protégées

---

## Pattern d'identité — Vendor Independence Auth

### Custom claims dans le token
```json
{
  "internal_id": "uuid-v4-stable",
  "roles": ["premium"],
  "email": "user@example.com"
}
```

### Règles absolues
- **`internal_id`** : UUID interne stable — utilisé dans toute la logique applicative et les appels API
- **`provider_uid`** : UID Firebase — encapsulé dans `lib/firebase.ts` uniquement, jamais propagé
- Les Server Components utilisent `getCurrentUser()` de `lib/auth/server/` qui retourne `{ internal_id, roles, email }`
- Les routes BFF (`app/api/`) transmettent le token JWT au backend qui extrait `internal_id`

```typescript
// ✅ lib/auth/server/index.ts
export async function getCurrentUser(): Promise<{ internal_id: string; roles: string[]; email: string }> {
  const session = await getSessionCookie();
  const decoded = await verifyFirebaseToken(session); // lib/firebase-admin.ts
  return {
    internal_id: decoded.internal_id,
    roles: decoded.roles ?? ['free'],
    email: decoded.email,
  };
}
```

---

## Vendor Independence Universelle

**Règle : tout service externe est encapsulé derrière un service dans `src/lib/` ou `src/features/{domain}/services/`.**

| Outil externe | Encapsulation | Fichier |
|--------------|--------------|---------|
| Firebase Auth (client) | `signIn`, `signOut`, `onAuthChange` | `lib/firebase.ts` uniquement |
| Firebase Admin (server) | `verifyToken`, `getUser` | `lib/firebase-admin.ts` uniquement |
| OpenAI (via BFF) | `AIService.complete()` | `features/ai/services/AIService.ts` |
| AWS S3 (via `/api/storage`) | `StorageService.upload()` | `features/storage/services/` |

- JAMAIS d'import direct de `firebase/auth` dans les composants ou features
- JAMAIS d'appel direct à une API externe — tout transite par les routes BFF `/api/*`
- Changer de provider = modifier uniquement le fichier d'encapsulation

---

## Onboarding — driver.js

L'onboarding web utilise **driver.js** (MIT, 5kb, zero deps, 25k+ ⭐ GitHub).

```bash
# Installation
npm install driver.js
```

### Règles d'implémentation
- Le flag d'onboarding est stocké en cookie `HttpOnly` `onboarding_completed` géré par `/api/onboarding`
- L'initialisation se fait dans un composant client dédié : `features/onboarding/components/OnboardingTour.tsx`
- Thémé avec les variables CSS : `--color-primary`, `--color-surface`, `--font-body`
- 4 étapes maximum par tour ; possibilité de skip à tout moment
- Réactivable depuis les Settings utilisateur

```typescript
// features/onboarding/components/OnboardingTour.tsx
'use client';
import Driver from 'driver.js';
import 'driver.js/dist/driver.css';

const driver = new Driver({
  popoverClass: 'mdb-tour',
  nextBtnText: 'Suivant →',
  prevBtnText: '← Précédent',
  doneBtnText: 'C\'est parti !',
  onDestroyed: () => fetch('/api/onboarding', { method: 'POST' }),
});
```

- Le CSS de driver.js est surchargé via `globals.css` pour utiliser les tokens couleurs

---

## Nouvelles Technologies à Surveiller

Être force de proposition sur :

### Next.js et React
- **Server Actions** — formulaires sans API route pour les mutations simples (Next.js 15+)
- **Partial Prerendering (PPR)** — hybride static + dynamic dans la même page (Next.js 15.3+)
- **React 19 `use()` hook** — simplification data fetching dans les RSC
- **`next/after`** — exécuter du code post-réponse (analytics, logs) sans bloquer

### Progressive Web App
- **PWA manifest + Service Worker** — offline support pour le dashboard, cache des assets statiques
- Utiliser `next-pwa` ou `@ducanh2912/next-pwa` (Workbox)

### Performance
- **`next/image`** — obligatoire pour toutes les images, format WebP + AVIF automatique
- **`next/font`** — auto-optimisation des fonts, zéro CLS
- **Bundle analysis** — `@next/bundle-analyzer` avant chaque release majeure

### Règle de veille
Avant d'intégrer une nouvelle lib : licence MIT/Apache uniquement, bundle size < 50kb gzipped, support Next.js App Router vérifié. Documenter dans `docs/tech-decisions.md`.

---

## Métriques de succès Web

| Indicateur | Cible |
|------------|-------|
| LCP (Largest Contentful Paint) | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 |
| INP (Interaction to Next Paint) | < 200ms |
| Score Lighthouse | > 90 (perf + accessibilité) |
| Conversion free → premium (web) | > 5% à 30 jours |

Ces métriques orientent les arbitrages SSR vs CSR, lazy loading, et priorité des features.
