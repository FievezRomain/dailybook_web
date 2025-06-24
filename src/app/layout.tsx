import { quicksand } from '@/theme/fonts';
import { ReactNode } from 'react';
import '@/app/globals.css'
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
        <body className={quicksand.className}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
            </ThemeProvider>
        </body>
    </html>
  );
}