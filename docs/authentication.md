# 🔐 Authentification

## Vue d'ensemble

L'application utilise **Firebase Authentication** pour gérer l'inscription, la connexion et la vérification d'e-mail. Le token Firebase est ensuite stocké dans un **cookie de session HTTP-only** pour sécuriser les requêtes côté serveur.

---

## Flux d'authentification

### 1. Inscription

```
Utilisateur → RegisterForm → Firebase Auth (createUser) → Redirection /verify-email
```

1. L'utilisateur remplit le formulaire d'inscription.
2. `registerUser()` (dans `firebaseService.ts`) crée le compte Firebase.
3. Un e-mail de vérification est envoyé automatiquement.
4. L'utilisateur est redirigé vers `/verify-email`.

### 2. Vérification d'e-mail

```
Utilisateur → Clic sur le lien dans l'e-mail → VerifyEmailClient (polling) → Session cookie → /dashboard
```

1. La page `/verify-email` affiche un message et un bouton pour renvoyer l'e-mail.
2. Un `setInterval` vérifie toutes les 3 secondes si l'e-mail a été validé (`auth.currentUser.reload()`).
3. Une fois validé, le front récupère un `idToken` frais et appelle `POST /api/session/login` pour créer le cookie de session.
4. Redirection vers `/dashboard`.

### 3. Connexion

```
Utilisateur → LoginForm → Firebase Auth (signIn) → vérif email → POST /api/session/login → cookie → /dashboard
```

1. L'utilisateur se connecte via `signInUser()`.
2. On vérifie que l'e-mail est validé (`isEmailVerified()`).
   - Si non validé → redirection vers `/verify-email`.
3. On récupère le `idToken` et on l'envoie à l'API Route `POST /api/session/login`.
4. L'API Route crée un cookie de session sécurisé.
5. Redirection vers `/dashboard`.

### 4. Déconnexion

```
Utilisateur → Bouton déconnexion → POST /api/session/logout → suppression cookie → /login
```

---

## Cookie de session

| Propriété | Valeur |
|---|---|
| Nom (prod) | `__Secure-vasco-session` |
| Nom (dev) | `session` |
| Contenu | Firebase ID Token |
| HttpOnly | Oui (côté API Route) |
| Secure | Oui (en production) |
| Path | `/` |

Le nom du cookie est défini dans `src/constants/cookies.ts`.

---

## Middleware

Le fichier `middleware.ts` (racine du projet) intercepte les requêtes et protège les routes :

```typescript
// Routes protégées : /dashboard, /(private)/*
// Routes auth : /login, /register
```

### Logique

1. Lire le cookie de session.
2. Vérifier le token avec `firebase-admin.auth().verifyIdToken()`.
3. Si la route est **protégée** et le token **invalide** → redirection vers `/login`.
4. Si la route est une **page auth** et le token **valide** → redirection vers `/dashboard`.

### Matcher

```typescript
export const config = {
  matcher: [
    '/(private)/:path*',
    '/login',
    '/register',
  ]
};
```

---

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `src/lib/firebase.ts` | Configuration Firebase (client-side) |
| `src/lib/firebase-admin.ts` | Configuration Firebase Admin (server-side) |
| `src/lib/firebaseService.ts` | Fonctions utilitaires (signIn, register, sendVerificationEmail, etc.) |
| `src/constants/cookies.ts` | Nom du cookie de session |
| `middleware.ts` | Protection des routes |
| `src/app/api/session/login/` | API Route pour créer le cookie |
| `src/app/api/session/logout/` | API Route pour supprimer le cookie |

---

## Intercepteur Axios (auto-logout)

L'instance Axios client (`src/lib/axios.ts`) possède un intercepteur de réponse qui :

1. Détecte les réponses `401 Unauthorized`.
2. Supprime le cookie de session côté client.
3. Redirige automatiquement vers `/login`.

Cela garantit qu'un token expiré ou révoqué ne bloque pas l'utilisateur dans un état incohérent.
