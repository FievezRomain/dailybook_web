# 📘 Vasco - Application Web

Bienvenue ! Ce projet contient l'application web **Vasco**, développée avec **Next.js** pour le front-end.  
Il s'accompagne d'une API back-end sous Node.js, ainsi que d'une base de données **PostgreSQL**.

---

## 🚀 Démarrage du projet

### ✅ Prérequis

- [Node.js](https://nodejs.org/) (v18 recommandé)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/)
- Git

---

## 📦 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/FievezRomain/dailybook_web.git
```

### 2. Installer les dépendances du front
```bash
npm install
```

### 3. Lancer les services avec Docker
Le projet nécessite un service Docker :

- La base de données PostgreSQL

Voici le fichier docker-compose.yaml
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
#### A. Place ce fichier dans un dossier par exemple vasco_env/

Exemple de structure à avoir (contactez l'équipe pour obtenir un dump):
```lua
vasco_env/
├── docker-compose.yml
└── db/
    └── dump.sql
```
#### B. Démarrage de la base
```
cd vasco_env
docker compose up -d
```

#### C. Pour arrêter la base
```
docker compose down
```
### 4. Clôner le dépôt de l'API back (nécessite les accès, contactez l'équipe si besoin)
```bash
git clone https://github.com/FievezRomain/dailybook_srv_javascript.git
```

### 5. Installer les dépendances du back
```bash
npm install
```

### 6. Installer nodemon
```bash
npm install -g nodemon
```

### 7. Lancer l'API back
```bash
nodemon
```

### 8. Démarrer le front localement
```
npm run dev
```
Puis ouvre ton navigateur à l’adresse : http://localhost:3000
