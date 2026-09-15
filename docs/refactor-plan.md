# Plan de refonte de Vasco Web

## Objectif

Reconstruire le web sur les contrats FastAPI et les règles métier Vasco, sécuriser le BFF et obtenir une architecture conforme aux pratiques actuelles de Next.js, React, du web et de la sécurité.

## Principes de migration

- Le legacy est une source d’information, jamais une contrainte de compatibilité.
- Supprimer ou casser explicitement l’ancien code lorsqu’il n’est pas conforme ; ne conserver que ce qui est déjà adapté à la cible.
- Interdire fallback, façade, alias, double configuration, double route et feature flag destinés à maintenir le legacy.
- Remplacer chaque domaine verticalement par une seule implémentation cible, sans période de coexistence.
- Ajouter les tests avant ou avec chaque changement de contrat.
- Ne pas mélanger refonte visuelle générale et migration API critique dans une même livraison.

## Suivi entre conversations

- `[ ]` : non commencé ou non vérifié.
- `[x]` : terminé, vérifié et documenté.
- Les phases sont exécutées strictement dans l’ordre. La phase N+1 reste bloquée tant que la case « Clôture de la phase N » et son critère de sortie ne sont pas validés.
- Des sous-tâches déjà réalisées hors séquence restent cochées pour conserver un suivi factuel, mais elles ne rendent pas leur phase active et ne permettent pas de poursuivre cette phase.
- Une conversation ne coche une case qu’après implémentation et vérifications adaptées au risque.
- Si une case est partiellement réalisée, elle reste décochée et une sous-case `[x]` décrit la partie terminée.
- À la fin de chaque conversation, mettre ce document à jour avant le compte rendu final.

## Phase 0 — Stabilisation et décisions

Livrables :

- [x] **Clôture de la phase 0** — tous les livrables ci-dessous et le critère de sortie sont vérifiés.
- [x] Contrat d’authentification Next.js -> FastAPI validé.
- [x] Inventaire initial des routes `/api/v1` et correspondance BFF documentés.
- [x] Convention d’erreurs implémentée dans le BFF.
- [x] Choix définitif : TanStack Query v5 ; SWR sera supprimé pendant la migration des hooks, sans couche de compatibilité.
- [x] Baseline reproductible de tests, performance et accessibilité, avec dette initiale documentée dans `docs/quality-baseline.md`.
- [x] Supprimer les vulnérabilités critiques et élevées de production et d’outillage ; 6 modérées transitives Firebase Admin restent suivies faute de version corrigée compatible.
- [x] Tests E2E : connexion, session expirée, session révoquée et accès anonyme.
  - [x] Accès anonyme à toutes les pages privées et à `/api/me`.
  - [x] Rejet d’un cookie de session invalide et d’un ID token invalide.
  - [x] Connexion réussie avec une fixture Firebase Auth isolée.
  - [x] Session réellement expirée avec Firebase Auth.
  - [x] Session réellement révoquée avec Firebase Auth.

Critère de sortie : connexion, session expirée et accès anonyme sont testables de bout en bout.

État : **phase clôturée**. Le contrat d’identité et son cycle de vie sont couverts de bout en bout avec l’émulateur Firebase Auth isolé.

## Phase 1 — Fondation technique et sécurité

- [x] **Clôture de la phase 1** — tous les livrables ci-dessous et le critère de sortie sont vérifiés.

État : **phase clôturée**. Les frontières BFF, la session, la validation, le CSRF, les headers, les fichiers, les dépendances et les contrôles de livraison sont vérifiés.

- [x] Créer `shared/api/web-api-client.ts` et `backend-api-client.ts`.
  - [x] Marquer `backendApiClient` comme `server-only`.
  - [x] Utiliser exclusivement `VASCO_API_URL` dans `backendApiClient`, sans fallback.
  - [x] Migrer les imports directement vers les clients cibles et supprimer les façades historiques, sans couche de compatibilité.
- [x] Supprimer intégralement le reliquat `NEXT_PUBLIC_API_URL` et réimplémenter proprement la photo utilisateur.
  - [x] Supprimer `src/services/user_picture.ts` et son type, qui appelaient directement les anciennes routes `user_pictureByUser` et `/user_picture` ; la fonctionnalité reste volontairement indisponible jusqu’à sa réimplémentation sur le contrat courant.
  - [x] Utiliser le contrat courant : ticket d’upload `/api/files/*`, puis `PATCH /api/me` côté BFF vers `PATCH /api/v1/users/me` pour enregistrer le `filename`, conformément au mobile et à FastAPI.
  - [x] Faire transiter lecture, ajout et suppression par `webApiClient -> Route Handler Next.js -> backendApiClient` sans passer de token depuis le navigateur.
  - [x] Supprimer `src/lib/axios.ts` ainsi que `src/lib/apiClient.ts` et `src/lib/apiBack.ts`.
  - [x] Retirer `NEXT_PUBLIC_API_URL` de `.env.local`, des environnements de déploiement et de tout pipeline CI/CD.
    - [x] Renommer la variable locale en `VASCO_API_URL`.
    - [x] Retirer la variable du `Dockerfile` et du README.
  - [x] Vérifier avec `rg` qu’il ne reste aucune référence et que l’URL FastAPI n’apparaît plus dans les bundles client.

  Cette suppression est obligatoire parce que `NEXT_PUBLIC_API_URL` publie l’adresse FastAPI dans le JavaScript du navigateur, permet de contourner architecturalement le BFF et encourage la manipulation directe du credential. Le backend reste sécurisé par ses propres contrôles, mais le client web perdrait les validations, la normalisation d’erreurs, le CSRF et la journalisation centralisée du BFF.
- [x] Ajouter validation Zod, format d’erreur stable et request ID.
  - [x] Valider strictement les mutations `/api/v1` existantes et les paramètres dynamiques avec Zod.
  - [x] Fermer explicitement en `501 NOT_IMPLEMENTED` les mutations legacy plutôt que relayer leurs payloads non validés.
  - [x] Ajouter `x-request-id` aux succès et erreurs, et conserver le même identifiant sur les erreurs d’appel FastAPI.
- [x] Protéger le layout privé et chaque Route Handler.
  - [x] Protéger le layout privé par vérification serveur du session cookie.
  - [x] Retirer le middleware qui vérifiait incorrectement le session cookie comme ID token.
  - [x] Centraliser la vérification de session backend dans `backendApiClient` et vérifier les Route Handlers privés existants.
- [x] Ajouter la protection CSRF, les cookies complets et les headers de sécurité.
  - [x] Compléter les attributs du cookie de session.
  - [x] Contrôler l’origine sur les endpoints login/logout.
  - [x] Étendre la protection CSRF double-submit à toutes les mutations BFF existantes, avec initialisation automatique du jeton par `webApiClient`.
  - [x] Ajouter et tester CSP, HSTS, `nosniff`, Referrer-Policy et Permissions-Policy.
- [x] Valider les URLs présignées et ouvrir avec `noopener,noreferrer`.
  - [x] Refuser hors HTTPS, hostname non exact, port non standard, credentials et fragment côté BFF puis côté navigateur.
  - [x] Centraliser les ouvertures dans un nouvel onglet avec neutralisation de `window.opener`.
- [x] Bloquer HTML/SVG et MIME falsifiés dans la chaîne d’upload.
  - [x] Contraindre type et taille dans la policy S3, puis revérifier taille, MIME, extension et signature binaire côté backend.
  - [x] Supprimer tout objet invalide ou contenant des marqueurs de contenu actif avant son association à une entité.
  - [x] Forcer les PDF en téléchargement avec `Content-Disposition: attachment`.
- [x] Mettre à jour Next, Axios, Firebase Admin et dépendances transitives après tests.
  - [x] Verrouiller Next 16.3.2, Axios 1.19.0, Firebase 12.18.0, Firebase Admin 14.3.0 et React 19.2.8.
  - [x] Actualiser toutes les dépendances dans leurs plages semver compatibles et valider tests, typecheck et build.
  - [x] Documenter les 6 alertes modérées de production sans correctif compatible, sans rétrogradation ni override de major non supporté.
- [x] Réactiver ESLint pendant la livraison et ajouter les scripts CI.
  - [x] Migrer vers la configuration flat native de Next 16 et corriger toutes les erreurs ESLint.
  - [x] Borner à 117 les avertissements legacy, avec exceptions limitées à des fichiers explicitement nommés.
  - [x] Ajouter une CI Node 22.13 exécutant installation verrouillée, lint, typecheck, tests, build et audit de production.

Critère de sortie : aucune route BFF ne relaie un payload non validé ou une identité ambiguë ; `NEXT_PUBLIC_API_URL`, `src/lib/axios.ts` et les appels navigateur directs à FastAPI ont disparu du code, du Dockerfile et des environnements.

## Phase 2 — Migration API par domaine

- [x] **Clôture de la phase 2** — tous les domaines et le critère de sortie sont vérifiés.

État de rupture clôturé : tous les Route Handlers métier utilisent désormais les routes REST `/api/v1`. Les derniers `/api/storage`, service de stockage et helper de routes legacy sans consommateur ont été supprimés ; aucune façade de compatibilité ne subsiste.

Ordre recommandé :

1. [x] Utilisateur/session.
   - [x] Remplacer `/api/user` par les routes BFF validées `/api/auth/session` et `/api/me`, sans appel legacy.
   - [x] Séparer création du cookie Firebase et ouverture idempotente du profil FastAPI, avec destruction de la demi-session en cas d’échec.
   - [x] Aligner les schémas runtime et types sur `subscription`, profil, préférences et photo renvoyés par FastAPI.
   - [x] Migrer le cache utilisateur de SWR/`UserContext` vers TanStack Query v5 et adapter tous les consommateurs.
   - [x] Couvrir session, CSRF, lecture, mutation, réponse divergente et photo par tests web, puis le contrat utilisateur par tests backend.
2. [x] Animaux et fichiers.
   - [x] Remplacer les handlers legacy `equideByUser` et `bodyPictures` par les routes BFF REST `/api/animals`, historiques et suivi corporel.
   - [x] Aligner les schémas runtime et types sur FastAPI (`couleur`, `idanimal`, dates ISO, provenance `owner`/`shared`) sans réponse `.rows`.
   - [x] Étendre `/api/files/*` aux ressources `animal` et `body` par une union validée, tout en continuant à dériver l’identité utilisateur côté serveur.
   - [x] Migrer le cache animaux et photos corporelles de SWR/`AnimalContext` vers TanStack Query v5, puis supprimer service, hook, Context et types legacy.
   - [x] Préserver les autorisations propriétaire/partage, rendre les animaux partagés non modifiables et appliquer Premium dès le ticket d’upload du suivi corporel.
   - [x] Remplacer la sentinelle image `todelete` par `image: null`, sécuriser les mises à jour partielles et nettoyer les objets remplacés ou orphelins.
   - [x] Couvrir contrats BFF, mutations, fichiers et rupture legacy par 50 tests web ; couvrir CRUD, historiques, fichiers et suivi corporel par 53 tests backend ciblés et 26 scénarios API E2E.
3. [x] Événements et highlights.
   - [x] Aligner les types et schémas runtime sur les événements, documents, scopes de récurrence et highlights FastAPI, sans enveloppe `.rows`.
   - [x] Remplacer `eventsByUser` par les routes BFF REST `/api/events`, `/api/events/[id]`, `/api/events/highlights` et les documents dédiés.
   - [x] Migrer lectures et mutations de SWR/`EventContext` vers TanStack Query v5, puis supprimer service, hook, Context et type legacy.
   - [x] Consommer anniversaires et rappels annuels depuis le backend dans le calendrier, sans recalcul côté navigateur.
   - [x] Préserver les scopes explicites, le verrou Premium des documents et le rollback des uploads orphelins PDF/JPEG/PNG.
   - [x] Couvrir les contrats événement/highlight/document et la rupture legacy par 59 tests web ; couvrir événements, fichiers et API critique par 89 tests backend ciblés, dont 26 scénarios E2E.
4. [x] Objectifs et sous-tâches.
   - [x] Remplacer `objectifsByUser` et les faux chemins `/objectives` par les routes BFF validées `/api/objectifs` et `/api/objectifs/[id]`.
   - [x] Aligner les schémas et types sur `sousetapes`, les dates nullables, les animaux accessibles et les réponses FastAPI sans alias ni enveloppe `.rows`.
   - [x] Migrer le cache de SWR/`ObjectiveContext` vers TanStack Query v5 et réserver le `PATCH` dédié aux changements d’état atomiques.
   - [x] Garantir au moins une sous-tâche utile, synchroniser exactement les animaux et empêcher toute mutation d’une sous-tâche appartenant à un autre objectif.
   - [x] Préserver création, modification, duplication sans identifiants techniques et suppression, y compris pour les animaux partagés accessibles.
   - [x] Couvrir les contrats BFF et la rupture legacy par 65 tests web ; couvrir règles métier et CRUD complet par 40 tests backend ciblés, dont 26 scénarios E2E, avec une suite backend globale verte à 228 tests.
5. [x] Contacts, notes et souhaits.
   - [x] Remplacer `contactsByUser`, `notesByUser` et `wishsByUser` par les routes BFF REST `/api/contacts`, `/api/notes`, `/api/wishes` et leurs routes `[id]`.
   - [x] Aligner les schémas runtime et types sur les DTO FastAPI : e-mail Contact, métadonnées Markdown/nullables des Notes, prix chaîne, statut et image des Souhaits.
   - [x] Migrer les lectures et mutations de SWR vers TanStack Query v5, retirer les trois providers du layout puis supprimer services, hooks, Contexts et types legacy.
   - [x] Étendre le flux fichier sécurisé aux images de Souhaits (JPEG/PNG/WebP, 750 Ko), avec contrôle propriétaire et nettoyage des uploads orphelins.
   - [x] Corriger le mapping backend `email_contact` -> `email` et empêcher toute mutation d’image ou suppression d’un souhait appartenant à un tiers.
   - [x] Couvrir les routes BFF par 20 tests ciblés et une suite web globale verte à 81 tests ; couvrir les use cases par 46 tests backend ciblés et les quatre parcours API CRUD/isolement propriétaire.
   - Les écrans web Contacts, Notes et Souhaits n’existent pas encore dans le shell privé historique ; leur création visuelle reste volontairement hors phase 2 et relève des phases Architecture frontend puis UX/UI web.
6. [x] Groupes et invitations.
   - [x] Aligner les schémas runtime et types sur les groupes, buckets membres/animaux, invitations et propositions d’animaux FastAPI, avec identifiants numériques et statuts fermés.
   - [x] Remplacer la lecture legacy et les mutations fermées par les routes BFF REST du CRUD groupe, des invitations, membres et partages d’animaux, toutes validées et protégées par CSRF.
   - [x] Migrer le cache de SWR/`GroupContext` vers des hooks TanStack Query v5 par sous-ressource, retirer le provider global du layout puis supprimer service, hook, Context et type legacy.
   - [x] Préserver les règles backend : gestion Premium, consultation/réponse/proposition autorisées au membre gratuit d’un groupe actif, propriété animale et gestion manager.
   - [x] Normaliser les réponses backend sans ressource en `null` et la suppression de groupe en `204`, sans façade ni chemin de compatibilité.
   - [x] Couvrir les contrats BFF et mutations critiques par 10 tests ciblés et une suite web globale verte à 91 tests ; vérifier 21 scénarios backend Groupes/Invitations ciblés.
   - Les écrans web Groupes et Invitations n’existent pas encore dans le shell privé historique ; leur création visuelle et leurs états Premium restent volontairement hors phase 2 et relèvent des phases Architecture frontend puis UX/UI web.
7. [x] Notifications.
   - [x] Aligner les schémas runtime et types sur la liste persistante FastAPI, son compteur non lu, les quatre types fermés et la préférence de rappel quotidien.
   - [x] Exposer uniquement `/api/notifications`, `/api/notifications/[id]` et `/api/me/notification-preferences`, avec validation des chemins/bodies, CSRF et mutations normalisées en `204`.
   - [x] Filtrer `user_id` et `email` au BFF, conserver les informations d’action utiles et ne pas exposer le doublon backend `/users/me/notifications`.
   - [x] Fournir les hooks TanStack Query v5 pour lecture globale/individuelle, suppression, recalcul du badge et synchronisation de la préférence avec le cache utilisateur.
   - [x] Couvrir les contrats BFF par 10 tests ciblés et une suite web globale verte à 101 tests ; vérifier 8 scénarios backend Notifications/Préférences ciblés.
   - Aucun écran ou composant Notifications n’existe dans le shell web historique ; leur création visuelle, l’accès global et les états vide/erreur restent volontairement hors phase 2 et relèvent des phases Architecture frontend puis UX/UI web.
8. [x] Statistiques ; IA et voix reportées par décision produit.
   - [x] Aligner les sept types statistiques, la requête animaux/période et les deux familles de réponses FastAPI sur des schémas runtime stricts.
   - [x] Exposer `POST /api/statistics/[type]` avec validation du type, des identifiants, des dates, CSRF et préservation de l’erreur `PREMIUM_REQUIRED`.
   - [x] Fournir une API et un hook TanStack Query génériques, typés par type statistique, avec cache de dix minutes et requête désactivée sans animal.
   - [x] Corriger l’adaptateur backend mémoire pour qu’il respecte les formes PostgreSQL `statistic[]` ou `statistic/history`, puis vérifier autorisation animale et gate Premium.
   - [x] Ne pas exposer l’IA de création ni les notes vocales/audio sur le web, conformément à la décision produit du 24 août 2026 ; leur éventuelle activation nécessitera un lot distinct.
   - [x] Couvrir le contrat BFF par 6 tests ciblés, vérifier 13 scénarios backend Statistiques/Premium, puis valider les suites globales à 106 tests web et 234 tests backend.
   - L’écran web Statistiques n’existe pas encore malgré son lien historique de navigation ; sa création et l’explication du gate Premium relèvent des phases Architecture frontend puis UX/UI web.

Pour chaque domaine :

- [x] Types générés/alignés sur OpenAPI.
- [x] Schémas runtime.
- [x] Route Handlers REST.
- [x] Hooks de lecture et mutation.
- [x] Adaptation des composants existants ; les domaines sans écran historique sont explicitement reportés aux phases 3 à 5.
- [x] Tests unitaires, contrat et E2E critique.
- [x] Suppression des anciens chemins (`eventsByUser`, `xxxByUser`, etc.).

Critère de sortie : aucun appel legacy du domaine et erreurs métier correctement présentées.

## Phase 3 — Architecture frontend

- [x] **Clôture de la phase 3** — tous les livrables et le critère de sortie sont vérifiés.

- [x] Créer `features/` et migrer domaine par domaine.
  - [x] Migrer le domaine utilisateur/profil : API, hooks, photo, contenu de page et menu compte sont regroupés dans `features/user`; la page reste une composition et la déconnexion utilise le client BFF commun. Tests ciblés : 13 scénarios utilisateur, dont le composant profil isolé des providers applicatifs.
  - [x] Migrer le domaine Animaux : composants, sélecteur, formulaire, utilitaires et écran sont regroupés dans `features/animals`; `app/(private)/animals/page.tsx` ne fait plus que composer la feature et les consommateurs utilisent ses imports cibles.
  - [x] Migrer le domaine Événements : écran Agenda, cartes, overlays, formulaire et utilitaires sont regroupés dans `features/events`; la page Calendar ne fait plus que composer la feature et les anciens chemins racine sont supprimés.
  - [x] Migrer le domaine Objectifs : écran, cartes, formulaire, hooks et utilitaires sont regroupés dans `features/objectives`; la page ne fait plus que composer la feature et les consommateurs Dashboard utilisent les imports cibles.
  - [x] Migrer le Dashboard dans `features/dashboard` et supprimer son appel navigateur direct à OpenWeather ainsi que la clé publique, les permissions et les origines CSP associées. La météo reste volontairement indisponible jusqu’à une réimplémentation BFF dédiée.
  - [x] Vérifier les domaines sans écran historique : Contacts, Notes, Souhaits, Groupes, Notifications et Statistiques possèdent déjà leurs API, schémas, types et hooks dans leurs features respectives ; leur future UI sera créée directement au bon emplacement.
- [x] Réduire les Contexts qui dupliquent SWR/Query.
  - [x] Supprimer `AnimalDeleteContext`, qui n’avait qu’un consommateur, et rapprocher la confirmation de l’écran Animaux. Conserver uniquement le contexte visuel du formulaire, partagé entre le shell/FAB et l’écran, dans `features/animals/context`.
  - [x] Localiser les trois Contexts Événements dans `features/events/context` : ils coordonnent uniquement les overlays partagés entre listes, dashboard, agenda et shell, sans recopier les données TanStack Query. Le formulaire est réinitialisé par une nouvelle instance à chaque ouverture, sans effet de synchronisation legacy.
  - [x] Supprimer `ObjectiveDeleteContext`, mono-consommateur, et rapprocher la confirmation de `ObjectiveList`. Localiser le seul contexte visuel restant — le formulaire partagé entre FAB, listes et shell — dans `features/objectives/context`, avec une instance neuve à chaque ouverture.
  - [x] Vérification finale : `src/context` ne contient plus aucun Context actif. Les seuls Contexts restants sont locaux aux features et coordonnent des overlays transverses, sans données serveur.
- [x] Déplacer les brouillons multi-étapes dans des stores dédiés seulement si nécessaire.
  - [x] Audit effectué : aucun parcours web actuel ne conserve un brouillon entre plusieurs étapes ou routes. Les formulaires restent locaux à leur feature ; aucun store global prématuré n’est ajouté.
- [x] Extraire les composants partagés de feedback, formulaire et layout.
  - [x] Regrouper le shell privé, la navigation responsive, le changement de thème et le FAB global dans `shared/components/layout`, ainsi que le formatage de date commun dans `shared/utils` ; corriger leur hydratation et leurs imports sans refonte visuelle.
  - [x] Classer les primitives, composants de feedback, contrôles de formulaire et providers dans `shared/components/{ui,feedback,forms,providers}` ; supprimer les anciens chemins `components/ui` sans alias ni réexport de compatibilité et couvrir la récupération des images signées après erreur.
- [x] Normaliser routes, noms de domaines et clés de cache.
  - [x] Aligner les routes de pages privées sur les domaines web en anglais (`/profile`, `/performances/objectives`, `/performances/statistics`, `/wishes`) et corriger leurs états actifs, sans modifier le contrat BFF `/api/objectifs` imposé par FastAPI.
  - [x] Conserver une clé TanStack Query canonique par ressource, ranger invitations et partages sous `groups`, et normaliser l’ordre des animaux dans les clés statistiques. Tests de clôture : 41 fichiers et 126 scénarios verts, avec lint, typecheck et build de production sous Node 22.13.0 sans erreur.
- [x] Documenter les dépendances autorisées entre dossiers.

Critère de sortie : une feature peut être testée sans monter tous les providers applicatifs.

## Phase 4 — Alignement métier

- [x] **Clôture de la phase 4** — tous les livrables et le critère de sortie sont vérifiés.

État : **phase clôturée**. Les règles métier web, entitlements, domaines secondaires et météo géolocalisée sont alignés sur leurs frontières sécurisées et couverts par les parcours critiques documentés.

- [x] Fondation visuelle web commune anticipée avant les nouveaux écrans métier.
  - [x] Remplacer le mélange de teintes historiques et de rôles Shadcn par des tokens sémantiques Light/Dark pour surfaces, textes, actions, statuts, focus et graphiques.
  - [x] Définir les échelles communes d’espacement, rayons, élévation et titres, puis les raccorder aux primitives Button, Card, Input, Textarea et Dialog ainsi qu’au shell de page partagé.
  - [x] Ajouter un mode global `couleurs accessibles`, indépendant de Light/Dark, persistant et appliqué avant hydratation, avec un contrôle accessible dans la barre d’application.
  - [x] Documenter qu’aucun état ni graphique ne peut dépendre uniquement de la couleur ; l’audit perceptif de chaque écran reste un critère de la phase 5.
  - Vérifications : quatre combinaisons Standard/Accessible × Light/Dark contrôlées dans le navigateur, persistance après rechargement, 148 tests web verts, lint, typecheck et build Next de production sous Node 22.13.0.

- [x] Provenance et lecture seule des animaux partagés.
  - [x] Fermer la provenance runtime à `owner/shared`, identifier visuellement et de façon accessible les animaux partagés, expliquer leur lecture seule et réserver les actions de modification, suppression et suivi corporel au propriétaire. Le backend reste la source de vérité des autorisations. Tests de clôture : 42 fichiers et 128 scénarios web verts.
- [x] Historique, dossier médical et suivi corporel.
  - [x] Exposer les quatre historiques datés (`poids`, `taille`, `food`, `quantity`) avec lecture partagée, CRUD propriétaire, confirmations destructives et invalidation des caches Animaux/historique.
  - [x] Corriger le contrat PostgreSQL en ajoutant le discriminant `item` au BFF, filtrer le dossier médical sur les racines `soins`/`rdv` affichables et trier les entrées de la plus récente à la plus ancienne.
  - [x] Afficher les documents éligibles via leurs URLs présignées contrôlées et relayer l’export PDF Premium propriétaire par un endpoint BFF privé, sans exposer FastAPI ni stocker la synthèse.
  - [x] Permettre le suivi photo Premium sur le mois courant ou les onze précédents, trier les photos en ordre antéchronologique, conserver les animaux partagés en lecture seule et confirmer la suppression ; FastAPI reste responsable de l’unicité mensuelle, de la fenêtre, de la concurrence et des droits.
  - Vérifications : 23 tests web Animaux ciblés, suite web globale à 137 tests, lint, typecheck et build Next de production sous Node 22.13.0 ; 31 tests backend ciblés Animaux/Fichiers/E2E verts.
- [x] Récurrence, scopes, documents et partage d’événements.
  - [x] Remplacer les fréquences legacy par les quatre valeurs canoniques FastAPI pour Soins/Balade, exiger une date de fin cohérente et préserver l’état explicitement choisi après sa proposition initiale.
  - [x] Demander une portée explicite `occurrence`, `following` ou `series` avant modification complète ou suppression d’une série, puis transmettre cette portée au BFF.
  - [x] Calculer les groupes éligibles par intersection des animaux acceptés, restreindre les animaux aux groupes destinataires lors d’une modification partagée et laisser FastAPI revalider atomiquement les droits.
  - [x] Corriger `todisplay` pour le dossier médical, confirmer les retraits, rattacher les nouveaux uploads par la route événement dédiée et empêcher une duplication de réutiliser les fichiers du source.
  - Vérifications : 17 tests web Événements ciblés, suite web globale à 143 tests, lint, typecheck et build Next de production sous Node 22.13.0 ; 86 tests backend Événements/Récurrence/Groupes/Fichiers verts.
- [x] Groupes actifs, invitations, membres et propositions d’animaux.
  - [x] Ajouter la destination privée `/groups` au shell web et s’appuyer sur le filtrage FastAPI/PostgreSQL pour ne présenter que les groupes dont le gestionnaire possède un Premium actif.
  - [x] Permettre à tout compte invité d’accepter ou refuser une invitation, puis à tout membre d’un groupe actif de le consulter, de le quitter et de proposer uniquement ses animaux de provenance `owner`, indépendamment de son propre abonnement.
  - [x] Séparer visuellement membres invités/acceptés et animaux proposés/acceptés ; réserver au gestionnaire Premium la création, la modification, la suppression, les invitations, le retrait d’un tiers et la décision sur une proposition.
  - [x] Conserver les actions Premium visibles avec une explication contextualisée, confirmer les refus et mutations destructives, et rappeler que les retraits suppriment les liens de partage sans supprimer les données d’origine.
  - Vérifications : 5 tests web Groupes ciblés, suite web globale à 147 tests, lint, typecheck et build Next de production sous Node 22.13.0 ; 17 tests backend Groupes verts.
- [x] Notifications et préférences.
  - [x] Ajouter la destination privée `/notifications` et une cloche globale dont le remplissage, le badge textuel plafonné à `99+` et le libellé accessible reflètent le compteur backend non lu.
  - [x] Couvrir les états chargement, vide, erreur et liste ; permettre lecture individuelle/globale et suppression confirmée sans faire dépendre l’état lu/non lu de la seule couleur.
  - [x] Traiter depuis la notification les invitations de membre et propositions d’animaux encore disponibles, avec confirmation Accepter/Refuser, mutation Groupes canonique et invalidation coordonnée des caches.
  - [x] Exposer la préférence de rappel quotidien depuis la même destination, la synchroniser avec le cache utilisateur et rendre l’accès disponible depuis le menu du compte.
  - Vérifications : 5 tests de composants Notifications ciblés, suite web globale à 153 tests, lint, typecheck et build Next de production sous Node 22.13.0 ; 31 tests backend Notifications/Utilisateur/Groupes verts. La revue visuelle authentifiée complète reste rattachée à la phase 5.
- [x] Premium gates cohérents.
  - [x] Centraliser les libellés métier et le parcours en deux temps : explication contextualisée, puis comparatif Gratuit/Premium avec accès au profil.
  - [x] Remplacer les verrous masqués, inertes ou seulement colorés sur les groupes, documents médicaux et photos corporelles par des actions visibles et accessibles.
  - [x] Rafraîchir les entitlements après un refus backend `PREMIUM_REQUIRED`, puis ouvrir le parcours correspondant sans afficher l’erreur brute.
  - [x] Conserver les exceptions d’un membre Gratuit dans un groupe actif et ne pas exposer sur le web les fonctions IA/voix encore hors périmètre produit.
  - Vérifications : 2 tests Premium communs et 2 scénarios Groupes ciblés ; suite web globale à 155 tests, lint, typecheck et build Next de production sous Node 22.13.0.
- [x] Notes modernes, voix, souhaits et statistiques.
  - [x] Ajouter les destinations privées `/notes` et `/wishes`, leurs états chargement/vide/erreur, recherche locale, formulaires réutilisant les hooks canoniques, actions `…` et confirmations de perte ou suppression.
  - [x] Conserver les notes en Markdown sous forme de texte sûr, permettre épinglage et tri, et brancher le raccourci global de création sur le vrai formulaire.
  - [x] Gérer les métadonnées et le statut des souhaits, valider les liens HTTP(S), afficher les images présignées et nettoyer un upload orphelin si la mutation métier échoue.
  - [x] Créer `/performances/statistics` avec sélection des animaux et de la période, sept indicateurs, gate Premium commun, états async et résultats accessibles sous forme de graphique accompagné de tables textuelles.
  - [x] Maintenir la décision produit du 24 août 2026 : ne pas exposer sur le web la note vocale ni la création assistée par IA ; leur activation exigera un lot distinct et des contrats validés.
  - Vérifications : 4 scénarios de composants ciblés, suite web globale à 159 tests, lint, typecheck et build Next de production sous Node 22.13.0. Les trois routes privées répondent et redirigent correctement vers `/login` sans session locale ; la revue visuelle authentifiée complète reste rattachée à la phase 5.
- [x] Météo web via BFF dédié, validée par décision produit du 25 août 2026.
  - [x] Exposer un endpoint privé Next.js `/api/weather` validé ; le navigateur ne contacte jamais directement MET Norway et ne connaît aucune clé météo.
  - [x] Arrondir les coordonnées à deux décimales, appliquer timeout, cache quinze minutes, quota défensif par compte et erreurs normalisées sans journaliser la position.
  - [x] Demander un consentement explicite avant la géolocalisation et couvrir attente, refus, indisponibilité, chargement, succès, erreur fournisseur et absence de configuration.
  - [x] Ouvrir uniquement `geolocation=(self)` dans `Permissions-Policy` ; la CSP conserve `connect-src` fermé au fournisseur grâce au BFF.
  - [x] Afficher conditions actuelles, humidité, vent, pluie et trois jours de températures/précipitations, avec libellés textuels et attribution MET Norway.
  - [x] Retenir MET Norway, gratuit y compris pour un usage commercial sous licences ouvertes avec attribution, plutôt que l’offre gratuite Open-Meteo incompatible avec une application à abonnement.
  - Vérifications : 10 scénarios Météo ciblés et 4 tests de headers, suite web globale à 169 tests, lint, typecheck et build de production sous Node 22.13.0.

Critère de sortie : matrice fonctionnelle web/backend documentée et couverte par les parcours critiques.

## Phase 5 — Refonte UX/UI web

- [ ] **Clôture de la phase 5** — tous les livrables et le critère de sortie sont vérifiés.

- [x] Produire ou valider les maquettes web Vasco.
  - [x] Auditer l'existant sans en faire une référence visuelle dans `docs/web-current-state-audit.md`.
  - [x] Documenter la direction visuelle, le responsive, les tendances admises et le ton dans `docs/web-design-direction.md`.
  - [x] Documenter navigation, interactions, conteneurs web et parcours dans `docs/web-navigation-and-interactions.md`.
  - [x] Spécifier fondations, modes, composants et patterns dans `docs/web-design-system-specification.md`.
  - [x] Spécifier mouvement, Glass, fallback Solid, préférences et budgets dans `docs/web-motion-and-materials.md`.
  - [x] Préparer la structure du fichier, les lots et le handoff dans `docs/web-figma-handoff.md`.
  - [x] Produire le backlog MCP détaillé des fondations, composants, patterns, écrans, overlays et prototypes dans `docs/web-figma-mockup-plan.md`.
  - [x] Inventorier les 14 routes web présentes, la destination `/contacts` manquante et leurs états obligatoires, puis fixer les largeurs Compact, Medium, Expanded, Wide et Ultra-wide dans `docs/web-screen-validation.md`.
  - [x] Valider le corpus de direction web avant production graphique.
  - [x] Créer ou désigner le fichier Figma Web, renseigner son URL et obtenir la validation produit des macro-lots F0 à F5, exécutés par les lots MCP M0 à M10.
- [x] Construire les fondations, tokens Light/Dark/Accessible et composants communs web dans Figma avant les écrans.
- [ ] Concevoir puis implémenter le shell, la navigation et le responsive sans reprendre le shell legacy.
- [ ] Implémenter le langage motion, le contrat Glass/Solid et leurs variantes Reduced Motion/Transparency.
- [ ] Recomposer les formulaires complexes selon le contexte web.
  - [x] Recomposer le parcours public connexion, inscription et vérification e-mail avec les primitives partagées, labels programmatiques, erreurs annoncées et mise en page fluide.
    - Vérifications : 5 tests publics ciblés, suite globale à 174 tests, lint, typecheck et build Next 16.3.2 sous Node 22.13.0 ; contrôles visuels à 390, 1024 et 1440 px, dont Dark + Couleurs accessibles.
- [ ] Standardiser overlays, confirmations et feedback async.
- [ ] Concevoir et valider le bloc météo responsive : chargement, succès, permission refusée, localisation indisponible, erreur fournisseur et absence de configuration.
- [ ] Réaliser l’audit WCAG 2.2 AA : clavier, lecteurs d’écran, focus non masqué, contrastes, forced colors, zoom et reflow.
- [x] Consigner la revue produit visuelle post-recette du 6 septembre 2026 et ouvrir le cycle correctif I12–I18, sans modifier les maquettes Figma.
- [ ] Exécuter I12–I18 : rebaseline, shell/identité, Home/Agenda, Animaux/Suivi, Groupes/Contacts, Notes/Souhaits/Notifications/Profil et recette corrective.

Critère de sortie : chaque écran validé possède tous ses états et passe la checklist de `web-ux-ui-standards.md`.

Suivi détaillé de l’implémentation : `docs/web-implementation-plan.md`. I12 et I13 sont clôturés ; la barrière active est I14. L'automatisation de la première recette I11 reste acquise, mais l'acceptation visuelle de la phase dépend désormais de la clôture I18.

## Phase 6 — Industrialisation

- [ ] **Clôture de la phase 6** — tous les livrables et le critère de sortie sont vérifiés.

- [ ] CI : lint, typecheck, tests, build, audit et E2E.
- [ ] Monitoring frontend/BFF avec request ID corrélé au backend.
- [ ] Budgets de performance et taille de bundle.
- [ ] Revue régulière des dépendances et secrets.
- [ ] Runbooks de session, upload, indisponibilité backend et rollback.

## Lots de livraison suggérés

| Lot | Contenu | Risque |
|---|---|---|
| A | Auth, BFF, CSRF, headers, dépendances | Critique |
| B | Animaux, fichiers, événements | Élevé |
| C | Objectifs, contacts, notes, souhaits | Moyen |
| D | Groupes, notifications, Premium | Élevé |
| E | Statistiques, IA, voix | Élevé |
| F | Design system et refonte responsive | Moyen |

## Definition of Done d’un domaine

- [ ] Routes FastAPI courantes uniquement.
- [ ] Schémas et types sans `any` aux frontières.
- [ ] Autorisations backend respectées.
- [ ] BFF authentifié, CSRF et validation actifs.
- [ ] Loading, vide, erreur, succès, interdit et Premium couverts.
- [ ] Clavier et responsive vérifiés.
- [ ] Tests unitaires, contrat et E2E du parcours critique.
- [ ] Ancien service, Context ou handler supprimé s’il n’a plus d’usage.
- [ ] Documentation mise à jour.

## Risques et parades

- Rupture de session : livrer l’authentification avant les domaines.
- Divergence de payload : générer les types depuis OpenAPI et tester les contrats.
- Double cache : choisir un seul gestionnaire d’état serveur.
- Régression métier : utiliser les règles communes et des scénarios E2E par rôle.
- XSS par fichiers : allowlist, détection MIME, domaine isolé et CSP.
- Refonte trop large : limiter chaque lot à un domaine ou une fondation mesurable.
