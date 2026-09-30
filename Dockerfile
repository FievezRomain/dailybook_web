# ---- Build phase -------------------------------------------------------
FROM node:22.13-alpine AS builder

WORKDIR /app

# Firebase Admin credentials are runtime-only and must never enter build layers.
# Build arguments (NEXT_PUBLIC_*)
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_BUCKET_HOSTNAME
ARG NEXT_PUBLIC_APP_VERSION

# Env variables required during next build
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_BUCKET_HOSTNAME=$NEXT_PUBLIC_BUCKET_HOSTNAME
ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION

# Copier uniquement les fichiers nécessaires aux dépendances
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste du code
COPY . .

# Build Next.js (génère .next + standalone)
RUN npm run build


# ---- Production phase -------------------------------------------------
FROM node:22.13-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copier l'application standalone
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

USER node

# Le serveur Node standalone écoute automatiquement sur 3000
EXPOSE 3000

CMD ["node", "server.js"]
