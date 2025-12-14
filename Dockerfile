# ---- Build phase -------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copier uniquement les fichiers nécessaires aux dépendances
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste du code
COPY . .

# Build Next.js (génère .next + standalone)
RUN npm run build


# ---- Production phase -------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copier l'application standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Le serveur Node standalone écoute automatiquement sur 3000
EXPOSE 3000

CMD ["node", "server.js"]
