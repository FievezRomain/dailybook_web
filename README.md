# 📘 Vasco and co — Application Web

**Vasco and co** est une application web de gestion quotidienne dédiée aux propriétaires d'animaux (principalement équins). Elle permet de centraliser événements, notes, objectifs, fiches animaux et bien plus dans un espace clair, sécurisé et responsive.

> **Stack** : Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Firebase Auth · Sentry · Docker

---

## 📑 Sommaire

- [Fonctionnalités](#-fonctionnalités)
- [Prérequis](#-prérequis)
- [Installation & Lancement](#-installation--lancement)
- [Variables d'environnement](#-variables-denvironnement)
- [Scripts disponibles](#-scripts-disponibles)
- [Mise en production](#-mise-en-production)
- [Documentation technique](#-documentation-technique)
- [Contribution](#-contribution)
- [Liens utiles](#-liens-utiles)

---

## ✨ Fonctionnalités

| Module | Description |
|---|---|
| **Dashboard** | Vue d'ensemble personnalisable avec un système de cartes en grille (drag & drop) |
| **Animaux** | Fiches complètes (général, santé, physique, évolution) avec avatar et images S3 |
| **Événements** | Création, édition, suppression via drawers — vue liste et calendrier (FullCalendar) |
| **Objectifs** | Suivi des performances avec barre de progression |
| **Notes** | Prise de notes rapide liée aux animaux / événements |
| **Calendrier** | Vue mensuelle interactive des événements |
| **Profil** | Gestion du compte utilisateur, photo de profil, préférences |
| **Auth** | Inscription, connexion, vérification e-mail, session cookie sécurisée (Firebase) |
| **Dark mode** | Thème clair / sombre via `next-themes` |

---

## ✅ Prérequis

| Outil | Version minimale |
|---|---|
| [Node.js](https://nodejs.org/) | v20 recommandé |
| [npm](https://www.npmjs.com/) | v9+ |
| [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/) | Pour la BDD et la prod |
| [Git](https://git-scm.com/) | — |

---

## 📦 Installation & Lancement

### 1. Cloner le dépôt

```bash
git clone https://github.com/FievezRomain/dailybook_web.git
cd dailybook_web
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.local.example .env
```

Voir la section [Variables d'environnement](#-variables-denvironnement) ci-dessous pour le détail de chaque variable.

### 4. Lancer la base de données (PostgreSQL)

Un fichier `docker-compose.yml` est fourni dans le dossier `vasco_env/` :

```bash
cd vasco_env
docker compose up -d
```

Pour arrêter la base :

```bash
docker compose down
```

### 5. Lancer le back-end

Le back-end est dans un dépôt séparé :

```bash
git clone https://github.com/FievezRomain/dailybook_srv_javascript.git
cd dailybook_srv_javascript
npm install
npm install -g nodemon
nodemon
```

### 6. Démarrer le front

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

---

## 🔑 Variables d'environnement

| Variable | Description | Exemple |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL de l'API back-end | `http://localhost:3001` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Clé API Firebase | `AIza...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Domaine auth Firebase | `myapp.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID du projet Firebase | `myapp-12345` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket Firebase Storage | `myapp.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID Firebase | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID Firebase | `1:123:web:abc` |
| `NEXT_PUBLIC_WEATHER_API_KEY` | Clé API météo | `abc123` |
| `NEXT_PUBLIC_BUCKET_HOSTNAME` | Hostname du bucket S3 (images) | `mybucket.s3.amazonaws.com` |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Clé privée Firebase Admin (server-side) | `-----BEGIN PRIVATE KEY-----\n...` |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Email du service account Firebase | `firebase-adminsdk@...` |
| `FIREBASE_ADMIN_PROJECT_ID` | ID projet Firebase Admin | `myapp-12345` |
| `SENTRY_DSN` | DSN Sentry (monitoring, prod uniquement) | `https://...@sentry.io/...` |

---

## 📜 Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarre le serveur de développement Next.js |
| `npm run build` | Build de production (output standalone) |
| `npm run start` | Lance le serveur de production |
| `npm run lint` | Exécute ESLint sur le projet |

---

## 🐳 Mise en production

Le front est conteneurisé via un **Dockerfile multi-stage** :

1. **Build** : `node:20-alpine` — installe les dépendances, build Next.js en mode `standalone`
2. **Run** : `node:20-alpine` — copie uniquement le build standalone, les fichiers statiques et le dossier `public`

L'orchestration complète (front + back + BDD + reverse proxy) est gérée dans le dépôt **[dailybook-project](https://github.com/FievezRomain/dailybook-project)**.

```bash
# Build de l'image
docker build -t vasco-front .

# Lancement
docker run -p 3000:3000 vasco-front
```

> En production, toutes les variables d'environnement sont passées en tant que `--build-arg` lors du build Docker.

---

## 📚 Documentation technique

La documentation détaillée se trouve dans le dossier [`docs/`](./docs/) :

| Document | Contenu |
|---|---|
| [Architecture](./docs/architecture.md) | Structure du projet, organisation des dossiers, patterns utilisés |
| [Stack technique](./docs/stack.md) | Technologies, librairies, choix techniques |
| [Authentification](./docs/authentication.md) | Flux Firebase Auth, middleware, session cookie |
| [API & Services](./docs/api-services.md) | Communication front/back, couche API, services |
| [Tailwind & Couleurs](./docs/tailwind-colors.md) | Système de couleurs, variables CSS, dark mode, palette complète |
| [Contextes React](./docs/contexts.md) | State management, types de contextes, flux CRUD, providers |
| [Composants & Next.js](./docs/components-nextjs.md) | Server/Client Components, composants génériques, patterns, flux de rendu |

---

## 🧑‍💻 Contribution

1. Fork le repo
2. Crée une branche (`git checkout -b feature/ma-feature`)
3. Commit tes modifications (`git commit -am 'feat: ma feature'`)
4. Push la branche (`git push origin feature/ma-feature`)
5. Ouvre une Pull Request

### Conventions

- **Branches** : `feature/xxx`, `fix/xxx`
- **Commits** : format [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`)
- **Code** : TypeScript strict, ESLint activé, Tailwind + shadcn/ui pour le style

---

## 🔗 Liens utiles

| Ressource | Lien |
|---|---|
| Repo back-end | [dailybook_srv_javascript](https://github.com/FievezRomain/dailybook_srv_javascript) |
| Repo orchestration (prod) | [dailybook-project](https://github.com/FievezRomain/dailybook-project) |
| Next.js | [nextjs.org/docs](https://nextjs.org/docs) |
| Tailwind CSS | [tailwindcss.com/docs](https://tailwindcss.com/docs) |
| shadcn/ui | [ui.shadcn.com](https://ui.shadcn.com) |
| Firebase | [firebase.google.com/docs](https://firebase.google.com/docs) |

---

## 📝 Notes

- Pour obtenir un dump de la base de données ou des accès aux services, contacter l'équipe technique.
- Pour toute question sur la mise en production, se référer au dépôt [dailybook-project](https://github.com/FievezRomain/dailybook-project).

---

**Bon développement ! 🐴**
