# Architecture cible de Vasco Web

## Objectif

Vasco Web est un client du même produit que Vasco Mobile. Il partage avec le mobile les règles métier et le contrat backend, mais possède une architecture de présentation et des interactions adaptées au navigateur.

Le front web utilise Next.js comme **Backend For Frontend (BFF)**. Le navigateur ne contacte jamais directement FastAPI : il appelle une route interne `/api/*`, qui authentifie et valide la requête avant de joindre `/api/v1/*` sur le backend Vasco.

```text
Navigateur
  -> feature / composant React
  -> hook de requête
  -> webApiClient (/api/*)
  -> Route Handler Next.js (BFF)
  -> backendApiClient serveur
  -> FastAPI (/api/v1/*)
  -> use case métier / repository
```

Le BFF réduit l’exposition de l’infrastructure et protège les secrets serveur. Il ne remplace pas les contrôles d’autorisation du backend : toute règle métier sensible reste vérifiée par FastAPI.

## Arborescence cible

```text
src/
  app/
    (public)/
      login/
      register/
      verify-email/
    (protected)/
      layout.tsx
      dashboard/
      agenda/
      animals/
      objectives/
      statistics/
      groups/
      contacts/
      notes/
      wishes/
      notifications/
      settings/
    api/
      auth/
      animals/
      events/
      objectives/
      statistics/
      groups/
      contacts/
      notes/
      wishes/
      notifications/
      files/
  features/
    animals/
      api/
      components/
      hooks/
      schemas/
      types/
      utils/
    events/
    objectives/
    groups/
    contacts/
    notes/
    wishes/
    notifications/
    statistics/
  shared/
    api/
      web-api-client.ts
      backend-api-client.ts
      api-error.ts
    auth/
    components/
      ui/
      feedback/
      forms/
      layout/
    config/
    hooks/
    schemas/
    theme/
    types/
    utils/
  test/
    factories/
    fixtures/
    msw/
```

## Règles de dépendance

- `app/` compose les pages, layouts et Route Handlers. Il ne contient pas de logique métier réutilisable.
- `features/<domaine>` contient l’interface, les hooks et les adaptateurs propres à un domaine.
- Une feature ne doit pas importer les détails internes d’une autre feature. Les éléments communs passent dans `shared/`.
- `shared/api/backend-api-client.ts` est exclusivement serveur et porte `import 'server-only'`.
- Le navigateur ne connaît ni l’URL FastAPI, ni un secret Firebase Admin, ni un credential AWS.
- Les décisions de droit, de propriété, de Premium et de visibilité restent dans FastAPI.
- Les données serveur sont gérées exclusivement par TanStack Query v5, pas dupliquées dans des Contexts. Les hooks SWR existants seront supprimés domaine par domaine sans adaptateur de compatibilité.
- Un store client est réservé aux brouillons, préférences d’interface ou états transverses non serveur.

## Responsabilités du BFF

Chaque Route Handler doit :

1. vérifier la session web ;
2. appliquer la protection CSRF sur les mutations ;
3. valider paramètres et payload avec un schéma ;
4. appeler une route backend explicitement déclarée ;
5. transmettre seulement l’identité attendue par FastAPI ;
6. convertir l’erreur backend vers un format web stable ;
7. filtrer les champs de réponse si nécessaire ;
8. ne jamais accepter une URL backend fournie par le client.

## Rendu serveur et rendu client

- Utiliser les Server Components pour les pages, layouts et données initiales qui n’exigent pas d’interaction navigateur.
- Ajouter `use client` au plus près du composant interactif.
- Les formulaires, drawers, calendriers et mises à jour optimistes sont des composants client.
- L’accès aux cookies et à Firebase Admin reste côté serveur.
- Une page protégée vérifie la session dans le layout serveur, indépendamment du middleware.

## Migration depuis l’existant

La migration se fait verticalement par domaine : route BFF, client, schémas, hooks, UI et tests. Les dossiers `context/`, les services historiques et les anciens handlers ne sont supprimés qu’après migration complète du domaine concerné.
