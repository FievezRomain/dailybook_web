# Stack et décisions techniques

## Socle

- Node.js 22.13 minimum, exigé par Firebase Admin 14 et les contrats ESM des outils actuels ;
- Next.js 16 App Router et React 19 ;
- TypeScript strict ;
- Firebase Authentication et Firebase Admin côté serveur ;
- TanStack Query v5 pour l’état serveur ; SWR est legacy et sera supprimé lors de la migration des hooks par domaine ;

### Décision d’état serveur

TanStack Query v5 est la cible unique. Vasco cumule listes/détails liés, mutations métier, invalidations croisées, mises à jour optimistes, pagination et préchargement App Router : ses clés structurées, son API dédiée aux mutations et ses mécanismes d’invalidation rendent ces flux plus explicites et testables. L’intégration RSC utilise `QueryClient`, `dehydrate` et `HydrationBoundary` lorsque le préchargement serveur apporte une valeur réelle.

SWR ne doit être utilisé dans aucun nouveau code. Les hooks SWR présents sont un inventaire legacy : ils seront remplacés, puis la dépendance `swr` sera supprimée, dans les lots de migration prévus. Aucun adaptateur de compatibilité SWR/TanStack ne sera créé.
- React Hook Form et Zod pour les formulaires ;
- Radix UI/shadcn comme primitives accessibles ;
- Tailwind CSS et variables CSS sémantiques ;
- Sentry avec filtrage des données sensibles ;
- Vitest, Testing Library, Playwright et axe. Lighthouse CI est interdit tant que sa chaîne de dépendances auditée reste vulnérable.

## Principes

- Server Components par défaut ; composants client uniquement lorsqu’une interaction le nécessite.
- BFF Next.js obligatoire pour les appels métier depuis le navigateur.
- Aucun accès direct à FastAPI depuis un composant client.
- Aucun SDK privilégié ou secret dans un bundle client.
- Contrats générés ou dérivés de l’OpenAPI FastAPI.
- Validation runtime aux frontières malgré TypeScript.
- Dépendances mises à jour régulièrement et audit bloquant sur les vulnérabilités critiques/élevées exploitables.

## Scripts attendus

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

Le build ne doit pas ignorer ESLint ou TypeScript. La CI exécute lint, typecheck, tests, build et audit avant livraison.

## Choix à éviter

- Context React pour dupliquer tout le cache serveur ;
- plusieurs clients Axios concurrents ;
- routes proxy génériques ;
- imports croisés entre features ;
- logique de droits Premium uniquement côté client ;
- valeurs de thème récurrentes en dur ;
- HTML utilisateur rendu sans sanitation ;
- variables secrètes préfixées `NEXT_PUBLIC_`.
