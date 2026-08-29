import { quicksand } from '@/theme/fonts';
import { ReactNode } from 'react';
import '@/app/globals.css'
import * as Sentry from "@sentry/react";
import ClientRoot from '@/shared/components/providers/ClientRoot';
import { headers } from 'next/headers';
import { colorVisionBootstrapScript } from '@/shared/theme/color-vision-bootstrap';

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <html lang="fr" suppressHydrationWarning>
        <head>
          <script nonce={nonce} dangerouslySetInnerHTML={{ __html: colorVisionBootstrapScript }} />
        </head>
        <body className={quicksand.className}>
            <ClientRoot nonce={nonce}>{children}</ClientRoot>
        </body>
    </html>
  );
}
