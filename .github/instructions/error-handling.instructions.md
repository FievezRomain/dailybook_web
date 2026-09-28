---
applyTo: "src/**/*.ts,src/**/*.tsx"
---

# Gestion d'erreurs — Web MyDailyBook (Next.js)

## Contrat d'erreur — format attendu de l'API

```typescript
// src/types/ApiError.ts
export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiError {
  code: AppErrorCode;
  message: string;
  details: ApiErrorDetail[];
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}
```

---

## Codes d'erreur sémantiques

```typescript
// src/types/AppErrorCode.ts
export enum AppErrorCode {
  UNAUTHORIZED        = "UNAUTHORIZED",
  TOKEN_EXPIRED       = "TOKEN_EXPIRED",
  FORBIDDEN           = "FORBIDDEN",
  NOT_FOUND           = "NOT_FOUND",
  CONFLICT            = "CONFLICT",
  VALIDATION_ERROR    = "VALIDATION_ERROR",
  QUOTA_EXCEEDED      = "QUOTA_EXCEEDED",
  FEATURE_UNAVAILABLE = "FEATURE_UNAVAILABLE",
  INTERNAL_ERROR      = "INTERNAL_ERROR",
  NETWORK_ERROR       = "NETWORK_ERROR",
}
```

---

## `src/utils/errorParser.ts` — Parser centralisé

```typescript
// src/utils/errorParser.ts
import axios, { AxiosError } from 'axios';
import { AppErrorCode, ApiError } from '@/types';

export interface ParsedError {
  code: AppErrorCode;
  message: string;
  details: { field: string; message: string }[];
  isNetworkError: boolean;
  isAuthError: boolean;
  isQuotaError: boolean;
}

export function parseApiError(error: unknown): ParsedError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ success: false; error: ApiError }>;

    if (!axiosError.response) {
      return {
        code: AppErrorCode.NETWORK_ERROR,
        message: 'Impossible de rejoindre le serveur. Vérifiez votre connexion.',
        details: [],
        isNetworkError: true,
        isAuthError: false,
        isQuotaError: false,
      };
    }

    const apiError = axiosError.response.data?.error;
    if (apiError) {
      return {
        code: apiError.code,
        message: apiError.message,
        details: apiError.details ?? [],
        isNetworkError: false,
        isAuthError: apiError.code === AppErrorCode.UNAUTHORIZED || apiError.code === AppErrorCode.TOKEN_EXPIRED,
        isQuotaError: apiError.code === AppErrorCode.QUOTA_EXCEEDED,
      };
    }
  }

  return {
    code: AppErrorCode.INTERNAL_ERROR,
    message: 'Une erreur inattendue s\'est produite.',
    details: [],
    isNetworkError: false,
    isAuthError: false,
    isQuotaError: false,
  };
}
```

---

## `error.tsx` et `global-error.tsx` — App Router

```typescript
// src/app/(private)/error.tsx
'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-lg font-semibold">Quelque chose ne s'est pas passé comme prévu</h2>
      <p className="text-muted-foreground text-sm">L'équipe a été notifiée automatiquement.</p>
      <button onClick={reset} className="btn-primary">Réessayer</button>
    </div>
  );
}
```

```typescript
// src/app/global-error.tsx
'use client';
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html>
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
          <h2>Une erreur critique s'est produite</h2>
          <button onClick={reset}>Réessayer</button>
        </div>
      </body>
    </html>
  );
}
```

---

## `useErrorToast` — Toast pour erreurs réseau/serveur (SWR + mutations)

```typescript
// src/hooks/useErrorToast.ts
'use client';
import { useCallback } from 'react';
import { toast } from 'sonner'; // ou shadcn useToast
import { ParsedError, AppErrorCode } from '@/utils/errorParser';

export function useErrorToast() {
  const showError = useCallback((error: ParsedError, onRetry?: () => void) => {
    // Erreurs de validation → affichage inline, pas de toast
    if (error.code === AppErrorCode.VALIDATION_ERROR) return;

    // Quota → toast avec lien upgrade
    if (error.isQuotaError) {
      toast.warning(error.message, {
        action: { label: 'Voir les offres', onClick: () => window.location.href = '/upgrade' },
      });
      return;
    }

    toast.error(error.message, {
      action: onRetry ? { label: 'Réessayer', onClick: onRetry } : undefined,
      duration: 5000,
    });
  }, []);

  return { showError };
}
```

---

## SWR — Configuration globale `onError`

```typescript
// src/app/(private)/layout.tsx ou providers/SWRProvider.tsx
'use client';
import { SWRConfig } from 'swr';
import { parseApiError, AppErrorCode } from '@/utils/errorParser';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <SWRConfig
      value={{
        onError: (error) => {
          const parsed = parseApiError(error);
          if (parsed.isAuthError) {
            router.push('/login');
            return;
          }
          if (parsed.code !== AppErrorCode.VALIDATION_ERROR) {
            toast.error(parsed.message, { duration: 5000 });
          }
        },
        shouldRetryOnError: (error) => {
          const parsed = parseApiError(error);
          return parsed.isNetworkError; // Retry uniquement sur les erreurs réseau
        },
        errorRetryCount: 2,
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

---

## React Hook Form — Erreurs inline depuis `details[]`

```typescript
// src/features/animals/components/AnimalForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { parseApiError } from '@/utils/errorParser';

export function AnimalForm() {
  const { setError, formState: { errors }, handleSubmit } = useForm<AnimalFormData>();

  const onSubmit = async (data: AnimalFormData) => {
    try {
      await AnimalService.create(data);
    } catch (err) {
      const parsed = parseApiError(err);

      if (parsed.details.length > 0) {
        parsed.details.forEach(({ field, message }) => {
          setError(field as keyof AnimalFormData, { message });
        });
        return; // Pas de toast pour les erreurs de validation
      }
      // Erreur non-validation → remonter pour le toast global
      throw err;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input ... />
      {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
    </form>
  );
}
```

---

## Comportement par code d'erreur

| Code | Comportement web |
|------|-----------------|
| `UNAUTHORIZED` | Redirect vers `/login` (middleware + SWR `onError`) |
| `TOKEN_EXPIRED` | Redirect vers `/login` avec message "Session expirée" |
| `FORBIDDEN` | Toast "Accès non autorisé" ou page 403 |
| `NOT_FOUND` | Page 404 Next.js (`notFound()`) ou toast selon le contexte |
| `VALIDATION_ERROR` | Erreurs inline sous les champs (jamais de toast) |
| `QUOTA_EXCEEDED` | Toast avec lien `/upgrade` |
| `FEATURE_UNAVAILABLE` | Composant `<UpgradePrompt feature="..." />` |
| `NETWORK_ERROR` | Toast + bouton "Réessayer" après 2 retries auto SWR |
| `INTERNAL_ERROR` | Toast générique + bouton "Réessayer" |

---

## Règles absolues

- `VALIDATION_ERROR` → **toujours** inline sur les champs, **jamais** en toast
- Erreurs réseau / 500 → **toujours** en toast, **jamais** silencieuses
- Le bouton "Réessayer" est visible **après** les 2 retries automatiques SWR seulement
- `QUOTA_EXCEEDED` et `FEATURE_UNAVAILABLE` ne sont pas des erreurs — ce sont des prompts d'upgrade
- Les messages viennent **toujours** du champ `message` de l'API — jamais de string hardcodée sauf fallback réseau
- Les Server Components utilisent `notFound()` ou `redirect()` de Next.js — jamais throw raw Error sans `error.tsx`
