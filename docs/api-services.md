# Contrat API et services web

## Principe

Le navigateur appelle uniquement les routes internes Next.js sous `/api`. Les Route Handlers appellent le backend Vasco sous `/api/v1` via un client serveur unique.

```text
webApiClient.get('/api/events')
  -> GET /api/events
  -> backendApiClient.get('/api/v1/events')
```

L’URL backend doit utiliser une variable serveur telle que `VASCO_API_URL`, sans préfixe `NEXT_PUBLIC_`.

## Clients HTTP

### Client navigateur

`web-api-client.ts` :

- base URL `/api` ;
- cookies same-origin ;
- timeout contrôlé ;
- ajout du token CSRF sur les mutations ;
- conversion uniforme des erreurs ;
- aucune connaissance de FastAPI.

Avant sa première mutation, le client appelle `GET /api/security/csrf`. Next.js pose un cookie `SameSite=Strict` lisible par le client et retourne le même jeton. Le client envoie ensuite ce jeton dans `x-csrf-token`. Le Route Handler exige la correspondance cookie/header ainsi qu’une origine same-origin.

### Client backend serveur

`backend-api-client.ts` :

- module `server-only` ;
- base URL issue de `VASCO_API_URL`, limitée à l’origine FastAPI sans chemin `/api/v1` (par exemple `http://localhost:8080`) ;
- timeout et limites de taille ;
- identité serveur/utilisateur ajoutée explicitement ;
- allowlist de chemins, méthodes et headers ;
- aucun proxy générique recevant une URL du navigateur ;
- journalisation sans token, cookie ni donnée personnelle sensible.

Les anciens modules `lib/apiClient.ts`, `lib/apiBack.ts` et `lib/axios.ts` ont été supprimés. Le code importe directement le client correspondant dans `shared/api`. Aucune façade de compatibilité ni aucun appel navigateur direct à FastAPI n’est autorisé.

## Correspondance cible

| Route web | Route FastAPI | Méthodes principales |
|---|---|---|
| `/api/auth/session` | `/api/v1/auth/session` | POST |
| `/api/me` | `/api/v1/users/me` | GET, PATCH |
| `/api/animals` | `/api/v1/animals` | GET, POST |
| `/api/animals/[id]` | `/api/v1/animals/{id}` | PUT, DELETE |
| `/api/animals/[id]/history` | `/api/v1/animals/{id}/history` | GET, POST, PUT, DELETE |
| `/api/animals/[id]/body-pictures` | route backend identique | GET, POST |
| `/api/animals/[id]/medical-record` | `/api/v1/animals/{id}/medical-record` | GET |
| `/api/events` | `/api/v1/events` | GET, POST |
| `/api/events/[id]` | `/api/v1/events/{id}` | PUT, PATCH, DELETE |
| `/api/events/highlights` | `/api/v1/events/highlights` | GET |
| `/api/events/[id]/documents/[filename]` | `/api/v1/events/{id}/documents/{filename}` | GET, POST, DELETE |
| `/api/objectifs` | `/api/v1/objectifs` | GET, POST |
| `/api/objectifs/[id]` | `/api/v1/objectifs/{id}` | PUT, DELETE |
| `/api/objectifs/[id]/subtasks/[subtaskId]` | route backend identique | PATCH |
| `/api/contacts` | `/api/v1/contacts` | GET, POST |
| `/api/contacts/[id]` | `/api/v1/contacts/{id}` | PUT, DELETE |
| `/api/notes` | `/api/v1/notes` | GET, POST |
| `/api/notes/[id]` | `/api/v1/notes/{id}` | PUT, DELETE |
| `/api/wishes` | `/api/v1/wishes` | GET, POST |
| `/api/wishes/[id]` | `/api/v1/wishes/{id}` | PUT, DELETE |
| `/api/groups` | `/api/v1/groups` | GET, POST |
| `/api/groups/[id]` | `/api/v1/groups/{id}` | PUT, DELETE |
| `/api/groups/[id]/invitations` | `/api/v1/groups/{id}/invitations` | POST |
| `/api/invitations` | `/api/v1/invitations` | GET |
| `/api/invitations/[id]` | `/api/v1/invitations/{id}` | PATCH |
| `/api/groups/[id]/animals` | `/api/v1/groups/{id}/animals` | GET, POST |
| `/api/groups/[id]/animal-shares/pending` | route backend identique | GET |
| `/api/animal-shares/[id]` | `/api/v1/animal-shares/{id}` | PATCH |
| `/api/groups/[id]/animals/[animalId]` | route backend identique | DELETE |
| `/api/groups/[id]/members` | `/api/v1/groups/{id}/members` | DELETE |
| `/api/notifications` | `/api/v1/notifications` | GET, PATCH |
| `/api/notifications/[id]` | `/api/v1/notifications/{id}` | PATCH, DELETE |
| `/api/me/notification-preferences` | `/api/v1/users/me/notification-preferences` | PATCH |
| `/api/statistics/[type]` | `/api/v1/statistics/{type}` | POST |
| `/api/weather` | MET Norway Locationforecast 2.0, serveur uniquement | GET |
| `/api/weather/locations` | recherche Nominatim côté serveur, sans autocomplétion | GET |
| `/api/files/*` | `/api/v1/files/*` | GET, POST, DELETE |

`objectifs` est le nom contractuel actuel. Le web ne doit plus alterner `objectives`, `objectif` et `objectifs` dans ses routes publiques internes.

Un objectif est créé ou remplacé avec sa liste complète `sousetapes`, qui doit contenir au moins une étape non vide. Les identifiants de sous-étapes existantes sont conservés pendant une modification et retirés lors d’une duplication. Le changement rapide d’état ne renvoie jamais l’objectif complet : il utilise exclusivement `PATCH /api/objectifs/[id]/subtasks/[subtaskId]` avec `{ "state": boolean }`. Le backend vérifie à la fois la propriété de l’objectif et l’appartenance de la sous-étape.

La photo utilisateur suit un flux borné : `POST /api/files/upload-url` ajoute côté BFF `ressourceType: user` et l’identifiant issu de `/api/v1/users/me`, le navigateur effectue le POST multipart contraint vers le stockage, puis `POST /api/files/upload-complete` valide taille, MIME et signature binaire. Le `filename` généré est ensuite enregistré par `PATCH /api/me`. Envoyer `{ "image": null }` retire explicitement la photo et provoque la suppression du fichier précédent côté backend.

Les documents d’événement utilisent le même flux borné avec `ressourceType: event` et uniquement PDF, JPEG ou PNG, dans la limite de 3 Mo. Pour une création, le ticket peut être demandé avant que l’événement ait un identifiant ; le `filename` généré est rattaché par `POST /api/events`, et un échec déclenche sa suppression via `/api/files/[filename]?resourceType=event`. Pour une modification, chaque nouvel upload finalisé est rattaché explicitement par `POST /api/events/[id]/documents/[filename]`, y compris lorsque la portée de série ne modifie pas les documents. Une suppression confirmée utilise la route `DELETE` dédiée afin de supprimer le stockage et la métadonnée ; une duplication ne réutilise jamais les fichiers de l’événement source. Lecture et suppression passent exclusivement par la ressource événement, qui vérifie l’accès métier. Les anniversaires et rappels annuels sont lus depuis `/api/events/highlights?year=AAAA` et ne sont jamais recalculés par le client.

Une série récurrente exige une portée explicite `occurrence`, `following` ou `series` pour toute mise à jour complète ou suppression. Les fréquences web émises sont uniquement `daily`, `weekly`, `biweekly` et `monthly`, pour les types FastAPI compatibles `soins` et `balade`, avec une date de fin non antérieure au début. Le partage web calcule l’intersection des groupes dont le bucket `accepted` contient tous les animaux sélectionnés ; lorsqu’un événement possède plusieurs groupes destinataires, les animaux proposés appartiennent à l’intersection de ces groupes. FastAPI revalide atomiquement accès animal, appartenance active et absence de repartage indirect.

Les historiques animaux sont lus par type (`poids`, `taille`, `food`, `quantity`) ; le BFF ajoute le discriminant `item` aux lignes PostgreSQL avant validation de la réponse. Le dossier médical web conserve uniquement les racines `soins`/`rdv` dont `todisplay` n’est pas faux. Son export Premium propriétaire passe par `/api/animals/[id]/medical-record` : le BFF relaie le PDF en téléchargement privé, sans stockage durable ni exposition de l’URL FastAPI. Le suivi corporel Premium accepte un mois parmi les douze mois glissants ; unicité mensuelle, fenêtre temporelle, propriété et concurrence restent contrôlées par FastAPI.

Contacts, notes et souhaits utilisent exclusivement leurs routes REST dédiées. L’identité propriétaire n’est jamais acceptée depuis le navigateur. Pour un contact, le champ de mutation backend reste `email_contact` et la réponse normalisée expose `email` ; `emailproprietaire` est dérivé de la session. Une note est persistée en Markdown avec `is_pinned` ; `created_at` et `updated_at` restent nullables pour les données historiques. Un souhait conserve `prix` sous forme de chaîne normalisée, accepte uniquement une URL HTTP(S), et utilise `image: null` pour retirer explicitement son image lors d’un `PUT`.

L’image d’un souhait suit le flux fichier avec `ressourceType: wish`, l’identifiant d’un souhait déjà créé, JPEG/PNG/WebP et 750 Ko maximum. Après upload et finalisation, le `filename` généré est associé par `PUT /api/wishes/[id]`. Si cette association échoue, le client supprime l’upload orphelin via `/api/files/[filename]?resourceType=wish&resourceId=<id>`. Le backend vérifie la propriété avant upload, lecture, remplacement, suppression ou nettoyage d’un fichier orphelin.

Les groupes et invitations utilisent exclusivement les routes imbriquées ci-dessus. Chaque lecture Groupe porte le booléen `active`, calculé par FastAPI depuis le Premium courant du gestionnaire : un groupe inactif reste lisible mais suspend invitations et partages. Créer, modifier ou supprimer un groupe, inviter un membre et accepter ou refuser une proposition d’animal sont des actions Premium contrôlées par FastAPI. Un membre gratuit d’un groupe actif peut toujours consulter le groupe, répondre à sa propre invitation et proposer uniquement ses propres animaux. Seul le manager peut gérer un autre membre ; un membre peut quitter lui-même le groupe et le manager ou le propriétaire de l’animal peut retirer un partage. Le BFF normalise en `null` les réponses backend sans ressource (refus d’invitation ou départ du groupe) et transforme la liste renvoyée après suppression d’un groupe en réponse `204`.

Les notifications persistantes sont l’unique source de la liste et du badge web. `GET /api/notifications` conserve le compteur `unreadCount`, mais filtre les colonnes backend `user_id` et `email` avant de répondre au navigateur. La lecture globale, la lecture individuelle et la suppression renvoient `204` après contrôle CSRF ; le cache TanStack Query recalcule ensuite le compteur sur la liste locale. La préférence de rappel quotidien utilise le contrat public `{ "dailyReminderEnabled": boolean }` via `/api/me/notification-preferences` et met à jour le cache de l’utilisateur courant. Le doublon backend historique `/api/v1/users/me/notifications` n’est pas exposé par le BFF.

Les statistiques sont Premium et passent uniquement par `POST /api/statistics/[type]`. Le BFF accepte les types `depenses`, `entrainements`, `balades`, `poids`, `tailles`, `alimentations` et `concours`, avec au moins un identifiant animal et une période ISO non inversée. FastAPI reste responsable du gate Premium et vérifie que tous les animaux sont possédés ou accessibles via un groupe actif. Les statistiques d’événements renvoient `statistic[]` ; poids, taille et alimentation renvoient un graphique `statistic` et un `history[]`. Les adaptateurs PostgreSQL et mémoire utilisent la même forme.

La météo passe exclusivement par `GET /api/weather`, réservé à une session authentifiée. Le navigateur demande un consentement explicite avant d’utiliser `navigator.geolocation`, exige une acquisition fraîche (`maximumAge: 0`) avec le mode haute précision, arrondit latitude et longitude à deux décimales et ajoute uniquement le fuseau IANA. L’interface signale la marge d’erreur lorsque le navigateur annonce une précision supérieure à un kilomètre. Next.js arrondit de nouveau, contacte le endpoint mondial `Locationforecast/2.0/compact` de MET Norway avec une identification Vasco sûre intégrée, surchargeable par `WEATHER_USER_AGENT`, puis normalise les conditions courantes et trois jours de prévision. Il résout aussi, côté serveur, un libellé ville/pays par géocodage inverse Nominatim ; la base est surchargeable par `GEOCODING_BASE_URL`, les coordonnées arrondies sont mises en cache 24 heures et une indisponibilité du géocodage n’empêche jamais l’affichage des prévisions. Si la localisation navigateur est fausse, une recherche manuelle soumise explicitement passe par `GET /api/weather/locations` puis utilise les coordonnées du résultat choisi ; aucune autocomplétion Nominatim n’est exécutée. La position n’est ni persistée ni journalisée par Vasco. Le cache météo dure quinze minutes et un quota défensif par compte borne les rafraîchissements. Le navigateur ne connaît aucune clé et ne contacte directement ni MET Norway ni Nominatim. L’interface affiche les attributions MET Norway et OpenStreetMap requises.

Décision produit du 24 août 2026 : la création assistée par IA et les notes vocales/audio ne font pas partie du périmètre Vasco Web actuel. Aucune route `/api/ai/*` ou `/api/notes/voice/*` n’est exposée par le BFF, et aucun brouillon audio n’est envoyé au backend. Les routes FastAPI existantes restent internes et pourront faire l’objet d’un lot distinct si le produit réactive ces fonctionnalités.

Le domaine utilisateur n’utilise plus `/api/user`. Après la création du cookie Firebase par `POST /api/session/login`, le navigateur appelle `POST /api/auth/session` avec le prénom Firebase et le fuseau IANA. Cette seconde étape ouvre ou rattache idempotemment le profil FastAPI. Si elle échoue, le client détruit immédiatement le cookie web. `GET /api/me` reste une lecture sans mutation et renvoie le profil filtré avec `subscription`, `dailyReminderEnabled` et les métadonnées de photo. `PATCH /api/me` accepte uniquement `prenom`, `newEmail` et `image`, puis relit la source backend avant de répondre.

## Format d’erreur web

```ts
type WebApiErrorPayload = {
  code: string;
  message: string;
  status: number;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
};
```

- Le corps JSON utilise exactement cette forme, avec le même statut dans la réponse HTTP et dans `status`.
- Chaque erreur contient un `requestId` généré par le BFF, également renvoyé dans le header `x-request-id`.
- Une validation Zod produit `VALIDATION_ERROR`/`422` et regroupe les messages dans `fieldErrors`.
- Un JSON illisible produit `MALFORMED_JSON`/`400`.
- Une erreur inconnue produit le message public générique `INTERNAL_ERROR`/`500`.
- Les erreurs FastAPI conservent leur code métier et leurs détails de champs, mais leurs messages techniques 5xx ne sont jamais exposés.
- Ne jamais déterminer le statut par recherche dans `error.message`.
- Ne pas exposer stack trace, URL interne, requête SQL ou message brut d’un fournisseur.

- Préserver les codes fonctionnels comme `PREMIUM_REQUIRED`, `FORBIDDEN`, `CONFLICT` et `VALIDATION_ERROR`.

## Validation

Les paramètres, query strings et bodies sont validés dans le Route Handler avant transmission. Les réponses critiques peuvent aussi être validées pour détecter une dérive de contrat.

Les schémas doivent couvrir en particulier : identifiants numériques, dates ISO, scopes de récurrence, listes d’animaux/groupes, taille et type MIME des fichiers, pagination et valeurs enum.

## Cache

- Une seule clé de cache canonique par ressource.
- Invalider les listes et détails concernés après mutation.
- Ne pas mettre en cache partagé une réponse personnalisée.
- Les URLs présignées expirent et ne doivent pas être persistées durablement.
- Les entitlements sont rafraîchis après un refus Premium du backend.
