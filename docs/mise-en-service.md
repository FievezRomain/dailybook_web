# Mise en service de Vasco Web

Ce document est la procédure de référence pour lancer, vérifier et déployer l’application web. Il ne contient aucune valeur secrète : les valeurs réelles restent dans les variables d’environnement locales, le coffre de secrets CI/CD ou la configuration du serveur.

## Architecture d’exécution

Le navigateur ne contacte jamais FastAPI directement :

```text
Navigateur -> Next.js :3000 -> Route Handlers /api/* -> FastAPI :8080 -> PostgreSQL/S3/Firebase
```

`VASCO_API_URL` est donc une variable **serveur uniquement**. Dans un conteneur, elle doit désigner une adresse joignable depuis le conteneur (`http://backend:8080` dans un réseau Compose, ou `http://host.docker.internal:8080` pour un back lancé sur l’hôte). Elle ne doit jamais devenir une variable `NEXT_PUBLIC_*`.

## Prérequis

- Node.js 22.13 ou supérieur ;
- npm et le `package-lock.json` du dépôt ;
- une API Vasco opérationnelle et sa base PostgreSQL ;
- les configurations Firebase client et serveur ;
- Docker 24+ et Docker Compose v2 pour le mode conteneurisé.

## Démarrage local en développement

Depuis la racine du dépôt web :

```powershell
Copy-Item .env.local.example .env.local
npm ci
npm run dev
```

Sous Linux ou macOS, remplacer la première commande par :

```bash
cp .env.local.example .env.local
```

Renseigner au minimum dans `.env.local` :

- `VASCO_API_URL=http://localhost:8080` — origine de FastAPI, sans `/api/v1` ;
- `NEXT_PUBLIC_FIREBASE_*` — configuration publique de l’application Firebase ;
- `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL` et `FIREBASE_ADMIN_PRIVATE_KEY` — session Firebase côté serveur ;
- `NEXT_PUBLIC_BUCKET_HOSTNAME` — hostname S3 exact, sans protocole ;
- `SENTRY_DSN` si la remontée d’erreurs est activée ;
- `WEATHER_USER_AGENT` si l’identification météo par défaut doit être remplacée.

Ouvrir ensuite <http://localhost:3000>. Le backend doit répondre sur <http://localhost:8080/health>.

### Vérification locale avant livraison

```bash
npm run lint:ci
npm run typecheck
npm run test:coverage
npm run build
npm audit --omit=dev --audit-level=high
```

Pour exécuter les parcours navigateur :

```bash
npx playwright install chromium
npm run test:e2e
```

Les tests E2E utilisent Firebase Emulator selon la configuration Playwright. Ils ne doivent pas cibler les comptes de production.

### Simuler le serveur de production sans Docker

```bash
npm run build
npm run start
```

Cette exécution vérifie le bundle de production sur le port 3000. Elle doit être préférée à `npm run dev` pour une recette finale locale.

## Exécution avec Docker

L’image est construite en plusieurs étapes et exécute le serveur Next.js standalone avec un utilisateur non privilégié.

Les variables `NEXT_PUBLIC_*` sont intégrées au bundle pendant le build. Elles doivent donc être transmises comme arguments de build. Les secrets serveur ne doivent jamais être passés comme arguments de build : ils sont injectés uniquement au démarrage du conteneur.

Exemple de build local :

```bash
docker build \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="valeur-publique" \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="projet.firebaseapp.com" \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="projet" \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="projet.appspot.com" \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="000000000000" \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="1:000000000000:web:identifiant" \
  --build-arg NEXT_PUBLIC_BUCKET_HOSTNAME="bucket.s3.amazonaws.com" \
  -t vasco-web:local .
```

Lancer le conteneur contre un backend exécuté sur la machine hôte :

```bash
docker run --rm --name vasco-web \
  -p 3000:3000 \
  --env-file .env.local \
  -e VASCO_API_URL=http://host.docker.internal:8080 \
  vasco-web:local
```

Sous Linux, ajouter si nécessaire :

```text
--add-host=host.docker.internal:host-gateway
```

Dans Docker Compose, utiliser plutôt `VASCO_API_URL=http://backend:8080` et placer `frontend` et `backend` sur un réseau commun.

Vérifications :

```bash
docker ps
docker logs -f vasco-web
curl -I http://localhost:3000
```

## Mise en production

L’orchestration globale se trouve dans le dépôt `dailybook-project`. Une mise en service complète suit cet ordre :

Après fusion sur `main`, Semantic Release analyse automatiquement les commits depuis le dernier tag : `fix:` produit un correctif, `feat:` une version mineure, et `!` ou `BREAKING CHANGE:` une version majeure. Le workflow crée le tag et la GitHub Release, puis publie l’image GHCR versionnée et `latest`. Aucun numéro de version ni aucune PR de release ne sont à saisir manuellement. Les autres préfixes (`docs:`, `test:`, `ci:`, `chore:`…) ne publient pas de version à eux seuls.

Le titre d’une PR doit suivre cette convention afin que son squash sur `main` reste exploitable, par exemple `feat: ajouter la vue planning`. Pour une PR de promotion de `develop` vers `main`, choisir le préfixe correspondant au changement le plus important qu’elle contient.

1. valider les quality gates web et back ;
2. sauvegarder PostgreSQL et vérifier le plan de restauration ;
3. publier des images immuables avec un tag de version ou un digest ;
4. déployer le backend et contrôler `/health` ainsi que les migrations ;
5. déployer le web avec `VASCO_API_URL` pointant vers le service backend interne ;
6. effectuer une recette courte : accueil public, connexion, agenda, création/lecture d’une ressource, téléchargement d’un document et déconnexion ;
7. surveiller les logs et Sentry.

Commandes d’exploitation depuis le dépôt d’orchestration :

```bash
docker compose -f docker-compose-prod.yml pull
docker compose -f docker-compose-prod.yml up -d
docker compose -f docker-compose-prod.yml ps
docker compose -f docker-compose-prod.yml logs --tail=200 backend frontend
```

Éviter `latest` pour une mise en production reproductible : renseigner dans le Compose les tags validés par la recette. Vérifier également que le Compose injecte bien les variables runtime du frontend ; une image web seule ne reçoit pas automatiquement les secrets Firebase Admin ou `VASCO_API_URL`.

## Retour arrière

Un rollback web ne modifie pas la base :

1. remettre le tag ou digest de l’image web précédemment validée ;
2. relancer uniquement `frontend` ;
3. contrôler les logs, la page d’accueil, l’authentification et un appel BFF ;
4. conserver les traces de la version retirée pour l’analyse.

```bash
docker compose -f docker-compose-prod.yml up -d frontend
docker compose -f docker-compose-prod.yml logs --tail=200 frontend
```

Si le déploiement accompagne une évolution de contrat backend, revenir à une combinaison web/back explicitement compatible.

## Diagnostic rapide

| Symptôme | Contrôle |
| --- | --- |
| Réponse BFF 502/503 | `VASCO_API_URL`, DNS/réseau Docker, `/health` du back |
| Authentification impossible | variables Firebase client, credentials Admin, horloge du serveur |
| Image distante refusée | `NEXT_PUBLIC_BUCKET_HOSTNAME` identique au hostname réellement signé |
| Variables publiques ignorées | reconstruire l’image : elles sont figées au build |
| Variable serveur ignorée | vérifier `docker inspect`/Compose puis recréer le conteneur |
| Build différent de la CI | utiliser Node indiqué par `.nvmrc` et `npm ci` |

## Arrêt local

- `Ctrl+C` pour Next.js lancé avec npm ;
- `docker stop vasco-web` pour le conteneur ;
- ne pas exécuter `docker compose down -v` en production : `-v` peut supprimer des volumes de données.
