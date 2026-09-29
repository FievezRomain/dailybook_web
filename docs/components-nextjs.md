# Composants et conventions Next.js

## Organisation

- `shared/components/ui` : primitives génériques accessibles.
- `shared/components/forms` : champs, erreurs, footer et confirmation de perte.
- `shared/components/feedback` : loading, empty, error, success, Premium gate.
- `shared/components/layout` : shell, navigation, page header et panneaux responsives.
- `features/<domaine>/components` : composants métier d’un seul domaine.

## Server et Client Components

- Une page et un layout restent serveur par défaut.
- Les données initiales peuvent être chargées côté serveur puis hydratées.
- Les handlers de clic, formulaires, browser APIs et hooks client restent dans des îlots `use client`.
- Ne pas transformer un arbre entier en composant client pour un seul bouton.

## API d’un composant

- Props typées sans `any`.
- Noms exprimant l’intention métier.
- États `loading`, `empty`, `error`, `success` et `forbidden` explicites.
- Les composants de présentation ne déclenchent pas directement des requêtes arbitraires.
- Une action sensible reçoit un callback confirmé, pas un accès direct au service.

## Formulaires

- Labels associés avec `htmlFor` et `id`.
- Erreurs reliées avec `aria-describedby` et `aria-invalid`.
- Validation client pour le feedback, validation BFF/backend pour la sécurité.
- Confirmation si fermeture d’un formulaire modifié.
- Une page, une modal ou un drawer sont choisis selon le contexte web ; une bottom sheet mobile n’est pas reproduite automatiquement.
- Le focus est placé sur le premier champ ou le titre, restauré à la fermeture et piégé dans une modal.

## Actions et feedback

- Toute suppression ou mutation sensible requiert une confirmation.
- Le bouton reste dans un état de chargement pendant la mutation et empêche les doubles soumissions.
- Une erreur conserve les valeurs saisies.
- Les fonctionnalités Premium restent visibles et ouvrent une explication contextualisée.
- Une action ne doit pas dépendre uniquement d’une icône ou d’une couleur.

## Notifications globales

- `NotificationBell` est l’accès global unique à `/notifications` et consomme la même clé TanStack Query que la liste.
- Le compteur provient de FastAPI ; les mutations locales le recalculent à partir des états de lecture confirmés.
- Les actions de groupe utilisent `object_id` uniquement pour les types fermés `group_member` et `group_animal` lorsque `action_available` vaut `true`.
- Une notification système sans destination explicite dans le contrat reste informative : le client ne devine jamais une URL à partir de son identifiant.

## Accès Premium

- `PremiumDialogProvider` est monté une seule fois dans `ClientRoot` ; une fonctionnalité verrouillée utilise `PremiumNotice` ou `usePremiumDialog` au lieu de créer son propre dialogue.
- Les contenus contextualisés sont définis dans `shared/premium/premium-features.ts`, sans dupliquer titres et explications dans les domaines métier.
- `usePremiumGate` reconnaît exclusivement le code backend `PREMIUM_REQUIRED`, rafraîchit l’utilisateur courant puis ouvre le parcours Premium ; les autres erreurs conservent leur traitement fonctionnel.
- Le comparatif décrit seulement les capacités réellement exposées sur le web. Les fonctions futures ne sont pas annoncées comme disponibles.

## Tests de composants

Chaque composant critique couvre : rendu nominal, clavier, libellés accessibles, loading, erreur, vide, Premium, Light/Dark et comportement responsive principal.
