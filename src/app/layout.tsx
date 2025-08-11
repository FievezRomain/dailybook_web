import { quicksand } from '@/theme/fonts';
import { ReactNode } from 'react';
import '@/app/globals.css'
import * as Sentry from "@sentry/react";
import ClientRoot from '@/components/ui/ClientRoot';

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
        <body className={quicksand.className}>
            <ClientRoot>{children}</ClientRoot>
        </body>
    </html>
  );
}