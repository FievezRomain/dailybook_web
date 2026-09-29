---
applyTo: "src/**/*.ts,src/**/*.tsx"
---

# Sécurité — Web MyDailyBook

## Session & cookies
- Le cookie de session doit être `HttpOnly`, `Secure`, `SameSite=Strict` — configuré dans `app/api/session/login/route.ts`
- Ne jamais stocker le Firebase ID token dans `localStorage` ou `sessionStorage` — uniquement le session cookie HttpOnly
- Le logout doit expirer le cookie côté serveur ET révoquer la session Firebase Admin

## Protection des routes
- Toutes les routes sous `/(private)/` sont protégées par `middleware.ts` — ne pas duplicer la vérification dans les pages
- Si un token session manque ou expire : `middleware.ts` redirige vers `/login` avec le `callbackUrl`
- Les routes `/api/*` protégées vérifient le cookie session via `lib/firebase-admin.ts` — ne jamais faire confiance au body de la requête pour l'identité

## Firebase — isolation
- Firebase client : uniquement `src/lib/firebase.ts` importe `firebase/auth` — jamais directement dans les composants
- Firebase Admin : uniquement `src/lib/firebase-admin.ts` — jamais dans des composants ou des hooks client
- Les composants client reçoivent l'utilisateur via le contexte ou un hook SWR, pas via Firebase SDK directement

## Validation des inputs
- Chaque mutation (formulaire, action) valide le body avec un schéma Zod avant d'appeler `/api/*`
- Les API routes (`app/api/`) re-valident le body avec Zod côté serveur — ne jamais faire confiance aux données client
- Pattern recommandé :
  ```typescript
  // app/api/animals/route.ts
  const schema = z.object({ name: z.string().min(1).max(100) });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  ```

## Fichiers & stockage
- Jamais construire une URL S3 côté client — toujours passer par `/api/storage` qui génère l'URL signée
- Les routes `/api/storage` vérifient que l'utilisateur est propriétaire du fichier avant de générer l'URL
- Ne jamais exposer le nom du bucket, la région AWS, ou la structure des paths S3 dans le HTML ou les réponses client

## XSS & injection
- `dangerouslySetInnerHTML` interdit sans sanitisation via DOMPurify
- Les données utilisateur affichées dans le DOM passent toujours par React (escaping automatique) — pas de concaténation de HTML
- Content Security Policy configurée dans `next.config.ts` via les headers

## Secrets & variables d'environnement
- Préfix `NEXT_PUBLIC_` uniquement pour les variables destinées au bundle client (Firebase config publique)
- Secrets serveur (Firebase Admin, AWS, DB) : variables sans `NEXT_PUBLIC_` — elles ne sont jamais envoyées au client
- Vérifier que `.env.local` est dans `.gitignore`

## Bonnes pratiques API routes
- Toujours retourner des codes HTTP appropriés (401, 403, 404, 422) et non juste `{ error: "..." }` avec 200
- Les API routes ne retournent jamais de stack trace en production
- Rate limiting à envisager sur les routes d'authentification (`/api/session/login`)
