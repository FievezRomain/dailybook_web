# Authentification et sécurité web

## Modèle retenu

Le navigateur s’authentifie auprès de Firebase puis envoie son ID token à `POST /api/session/login`. Next.js crée un cookie de session Firebase sécurisé et `HttpOnly`.

Dans l’implémentation web, la frontière Firebase utilise `POST /api/session/login`. Une fois ce cookie posé, `POST /api/auth/session` ouvre la session métier correspondante auprès de FastAPI `/api/v1/auth/session`. La navigation privée ne commence qu’après la réussite des deux opérations ; un échec de la seconde déclenche `POST /api/session/logout` pour éviter une demi-session. La lecture `GET /api/me` ne crée ni ne rafraîchit implicitement un utilisateur.

Ce cookie authentifie la session web. Il ne doit pas être lu par le JavaScript du navigateur et ne doit pas être traité comme un Firebase ID token.

Le contrat Next.js -> FastAPI retenu est le suivant :

- le BFF transmet le cookie de session dans `x-access-token` avec `x-client: web` ;
- FastAPI sélectionne alors `verify_session_cookie(..., check_revoked=True)` ;
- un client mobile conserve `x-client: mobile` et la vérification d’ID token ;
- le client ne peut pas contourner les droits métier, qui restent contrôlés dans les use cases et repositories.

Le nom historique `x-access-token` transporte donc deux types de credentials distingués par `x-client`. Une future version pourra remplacer ce contrat par des headers plus explicites sans modifier la session navigateur.

## Cookie de session

Le cookie doit définir :

- `HttpOnly: true` ;
- `Secure: true` en production ;
- `SameSite: Lax` au minimum ;
- `Path: /` ;
- durée documentée et cohérente avec la politique produit ;
- nom sans collision avec un cookie lisible côté client.

La déconnexion efface le cookie avec les mêmes attributs. La révocation distante est utilisée lorsque le produit exige la fermeture de toutes les sessions.

La création et la suppression de session refusent toute requête dont l’en-tête `Origin` ne correspond pas à l’origine Next.js. Les autres mutations BFF recevront la protection CSRF complète dans le lot de fondation suivant.

## Protection des pages

- Le layout privé vérifie la session côté serveur et redirige vers `/login` si elle est absente ou invalide.
- Aucun middleware Edge ne charge Firebase Admin ; la protection principale est effectuée par les layouts/pages serveur et les Route Handlers.
- Les noms des route groups Next.js ne figurent pas dans l’URL et ne doivent pas être utilisés comme préfixes publics dans le matcher.
- Chaque Route Handler protégé revérifie la session ; une page protégée ne sécurise pas automatiquement `/api/*`.

## CSRF

Comme l’authentification repose sur un cookie, toutes les mutations BFF doivent être protégées :

- validation stricte de `Origin` et éventuellement `Referer` ;
- token CSRF lié à la session pour POST, PUT, PATCH et DELETE ;
- cookies `SameSite` ;
- refus des contenus inattendus ;
- aucune mutation via GET.

Implémentation actuelle : les mutations métier utilisent un mécanisme double-submit (`vasco-csrf` + `x-csrf-token`) et vérifient également `Origin`. Les endpoints de création et suppression de session ne réutilisent pas ce cookie CSRF mais imposent une origine same-origin, car ils précèdent ou détruisent la session applicative.

## XSS et contenu actif

- Afficher les contenus utilisateurs par interpolation JSX ; React les échappe.
- Interdire `dangerouslySetInnerHTML` sauf composant riche explicitement audité.
- Si un rendu Markdown/HTML devient nécessaire, utiliser une chaîne de sanitation testée et une allowlist minimale.
- Valider toute URL avant `window.open`, lien ou redirection dynamique.
- Une URL présignée doit être HTTPS et appartenir à un hostname de stockage autorisé.
- Ouvrir avec `noopener,noreferrer`.
- Refuser les uploads HTML et SVG ; vérifier le contenu réel côté serveur.
- Servir les documents actifs en téléchargement et depuis un domaine sans cookies Vasco.

## Headers de sécurité

La production doit définir et tester :

- Content Security Policy avec nonce ou hashes ;
- `Strict-Transport-Security` ;
- `X-Content-Type-Options: nosniff` ;
- `Referrer-Policy` ;
- `Permissions-Policy` ;
- `frame-ancestors 'none'` dans la CSP ;
- `object-src 'none'` et `base-uri 'self'`.

Les domaines Firebase et S3/CDN autorisés sont ajoutés précisément. Ne pas utiliser `*` ni `unsafe-eval`.

Implémentation web : `src/proxy.ts` génère un nonce par requête de page et transmet la CSP à Next.js, qui nonce ses scripts de rendu. `next-themes` reçoit explicitement ce nonce depuis le layout racine. Deux styles inline stables générés par Next sont autorisés par hash ; aucun `unsafe-inline` n’est permis pour les scripts et `unsafe-eval` est limité au serveur de développement. Les origines Firebase et stockage sont normalisées puis ajoutées aux seules directives qui en ont besoin.

Les headers globaux sont `Strict-Transport-Security: max-age=31536000; includeSubDomains`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` et une `Permissions-Policy` qui refuse notamment caméra, microphone, géolocalisation, paiement, USB et tracking publicitaire. Une future fonctionnalité nécessitant un de ces capteurs devra recevoir une décision produit et une ouverture minimale dédiée.

## Uploads et URLs présignées

- Le navigateur ne décide jamais seul du MIME, du nom final ni des droits.
- Le backend vérifie propriétaire, ressource, entitlement Premium, taille, extension et signature du fichier.
- Après transfert direct vers S3, le backend relit les métadonnées et les premiers octets : le MIME doit être strictement identique au type autorisé, la signature JPEG/PNG/WebP/PDF doit correspondre et toute marque HTML, SVG, XML ou script provoque la suppression immédiate de l’objet.
- Les noms S3 sont générés côté serveur.
- Les téléchargements sont signés uniquement après contrôle de l’accès à la ressource.
- Les PDF sont servis avec `Content-Disposition: attachment` plutôt qu’exécutés inline dans le navigateur.
- Toute URL présignée renvoyée par le backend est validée par le BFF puis à nouveau avant son utilisation dans le navigateur : schéma HTTPS, hostname exact `NEXT_PUBLIC_BUCKET_HOSTNAME`, port standard, sans credentials ni fragment.
- `NEXT_PUBLIC_BUCKET_HOSTNAME` doit correspondre au hostname réellement produit par boto3, qui peut employer le endpoint virtuel global même lorsque la signature AWS reste régionale.
- Les ouvertures dans un nouvel onglet utilisent systématiquement `noopener,noreferrer` et neutralisent `window.opener`.
- Les erreurs ne révèlent ni bucket, clé interne, credential ni policy AWS.

## Secrets et données

- Les variables serveur n’utilisent pas `NEXT_PUBLIC_`.
- Firebase Admin, AWS et l’URL interne FastAPI restent côté serveur.
- Les clés destinées au navigateur sont limitées par origine et quota.
- Aucun token, cookie, URL présignée complète ou donnée médicale n’est écrit dans les logs.
- Sentry filtre les headers, cookies et champs personnels.

La configuration du SDK Firebase Web (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`) est publique par conception et peut utiliser `NEXT_PUBLIC_FIREBASE_*`. Elle identifie l’application Firebase mais n’accorde aucun privilège Admin. Sa sécurité dépend des Firebase Security Rules, d’App Check lorsque pertinent, des restrictions de clé et des origines autorisées.

À l’inverse, `FIREBASE_ADMIN_PRIVATE_KEY`, `FIREBASE_ADMIN_CLIENT_EMAIL` et tout credential de compte de service restent strictement serveur et ne doivent jamais recevoir le préfixe `NEXT_PUBLIC_`.

## Vérifications obligatoires

- session expirée et révoquée ;
- accès anonyme à chaque route privée ;
- CSRF sur chaque méthode de mutation ;
- IDOR sur chaque identifiant de ressource ;
- payloads XSS stockés dans chaque champ texte ;
- URL `javascript:`, `data:` et domaine non autorisé ;
- upload SVG/HTML, MIME falsifié et dépassement de taille ;
- dépendances avec `npm audit` et analyse SAST.

## Stratégie E2E d’authentification

Les tests Playwright exécutés contre le serveur Next de production couvrent sans fixture privilégiée : redirection de toutes les pages privées pour un visiteur anonyme, refus de `/api/me`, cookie de session invalide et rejet d’un ID token invalide.

Les scénarios de connexion réussie, expiration et révocation utilisent l’émulateur Firebase Auth isolé. La fixture crée un utilisateur éphémère et vérifié, obtient un vrai ID token, l’échange via le Route Handler Next.js, puis fait vérifier le cookie de session par Firebase Admin. L’expiration modifie le claim `exp` du cookie non signé propre à l’émulateur ; la révocation utilise `revokeRefreshTokens`. La fixture supprime toujours l’utilisateur après le test. Aucun bypass, mock ou secret Firebase de production n’est utilisé.
