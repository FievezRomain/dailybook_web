'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';

import { clearAuthenticatedClientState } from '@/features/user/utils/clear-authenticated-client-state';
import { auth } from '@/lib/firebase';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { retry: 1, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  }));
  const previousUid = useRef<string | null | undefined>(undefined);

  useEffect(() => onAuthStateChanged(auth, (user) => {
    const nextUid = user?.uid ?? null;
    if (previousUid.current !== undefined && previousUid.current !== nextUid) {
      void clearAuthenticatedClientState(queryClient);
    }
    previousUid.current = nextUid;
  }), [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
