import './globals.scss';
import { quicksand } from '@/theme/fonts';
import { ReactNode } from 'react';
import '@/app/globals.scss'
import { ThemeContextProvider } from '@/context/ThemeContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={quicksand.className}>
        <body>
            <ThemeContextProvider>
                {children}
            </ThemeContextProvider>
        </body>
    </html>
  );
}