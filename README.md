# 📘 Vasco - Application Web (Front-end)

Bienvenue ! Ce projet contient l'application web **Vasco**, développée avec **Next.js** pour le front-end.

- **Back-end** : Node.js (repo séparé)
- **Base de données** : PostgreSQL (via Docker, repo séparé)
- **Stockage** : S3 (AWS)
- **Monitoring** : Sentry
- **Authentification** : Firebase

---

## 🚀 Démarrage du projet (Développement)

### ✅ Prérequis

- [Node.js](https://nodejs.org/) (v18 recommandé)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/)
- Git

---

## 📦 Installation & Lancement

### 1. Cloner le dépôt

```bash
git clone https://github.com/FievezRomain/dailybook_web.git
cd dailybook_web
```

### 2. Installer les dépendances du front

```bash
npm install
```

### 3. Configuration des variables d'environnement

Copie le fichier `.env.local.example` en `.env` et adapte les valeurs si besoin :

```bash
cp .env.local.example .env
```

Vérifie notamment :
- `NEXT_PUBLIC_API_URL` (URL de l’API back)
- `NEXT_PUBLIC_FIREBASE_*` (config Firebase)
- `NEXT_PUBLIC_BUCKET_HOSTNAME` (S3)
- `SENTRY_DSN` (Sentry)

---

## 🐳 Mise en place des services nécessaires

La base de données et les autres services sont gérés dans un autre dépôt (voir section "Production").  
Pour le développement, tu peux utiliser ce `docker-compose.yml` minimal pour la base PostgreSQL :

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    container_name: dailybook_db
    environment:
      POSTGRES_USER: postgres # À modifier
      POSTGRES_PASSWORD: postgres # À modifier
      POSTGRES_DB: DailyBookDB
    ports:
      - "5432:5432"
    volumes:
      - dailybook_data:/var/lib/postgresql/data
      - ./db/dump.sql:/docker-entrypoint-initdb.d/dump.sql
    restart: unless-stopped

volumes:
  dailybook_data:
```

Place ce fichier dans un dossier (ex: `vasco_env/`) avec le dump SQL fourni par l'équipe.

```bash
cd vasco_env
docker compose up -d
```

Pour arrêter la base :
```bash
docker compose down
```

---

## 🔗 Lancer le back-end

Clône le dépôt back-end (contacte l'équipe si besoin d'accès) :

```bash
git clone https://github.com/FievezRomain/dailybook_srv_javascript.git
cd dailybook_srv_javascript
npm install
npm install -g nodemon
nodemon
```

---

## ▶️ Démarrer le front localement

Dans le dossier du front :

```bash
npm run dev
```

Puis ouvre ton navigateur à l’adresse : [http://localhost:3000](http://localhost:3000)

---

## 🐳 Mise en production

La mise en production et l’orchestration des services (front, back, base de données, etc.) sont gérées dans le dépôt **[dailybook-project](https://github.com/FievezRomain/dailybook-project)**.

**Résumé du process :**
- Le front est buildé et servi via Docker.
- Le back, la base de données et les autres services sont lancés via un `docker-compose` global.
- Pour toute mise en prod, se référer au README du repo `dailybook-project`.

---

## 📂 Structure du projet

```
dailybook_front_next/
├── src/
│   ├── app/                # Pages et routes Next.js
│   ├── components/         # Composants réutilisables
│   ├── hooks/              # Hooks personnalisés
│   ├── services/           # Appels API
│   ├── types/              # Types TypeScript
│   └── ...
├── public/                 # Fichiers statiques
├── package.json
├── next.config.ts
└── ...
```

---

## 🛠️ Développement

- **TypeScript** : Typage strict sur tout le projet.
- **TailwindCSS** : Utilisé pour le style.
- **SWR/React Query** (optionnel) : Pour la gestion du cache et des requêtes API.
- **Context API** : Pour la gestion des états globaux (auth, objectifs, animaux, etc.).
- **ESLint/Prettier** : Linting et formatage automatique.

---

## 🔗 Liens utiles

- [Repo back-end](https://github.com/FievezRomain/dailybook_srv_javascript)
- [Repo orchestration (prod)](https://github.com/FievezRomain/dailybook-project)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation TailwindCSS](https://tailwindcss.com/docs)

---

## 🧑‍💻 Contribution

1. Fork le repo
2. Crée une branche (`git checkout -b feature/ma-feature`)
3. Commit tes modifications (`git commit -am 'feat: ma feature'`)
4. Push la branche (`git push origin feature/ma-feature`)
5. Ouvre une Pull Request

---

## 📝 Notes

- Pour toute question sur la configuration ou la mise en prod, se référer au dépôt `dailybook-project` ou contacter l’équipe.
- Pour obtenir un dump de la base ou des accès, contacter l’équipe technique.

---

**Bon développement !**
