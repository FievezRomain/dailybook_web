import ResponsiveAppBar from '@/components/ResponsiveAppBar';
import { ThemeContextProvider } from '@/context/ThemeContext';
import '@/app/globals.scss'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
        <ThemeContextProvider>
            <ResponsiveAppBar />
            {children}
        </ThemeContextProvider>
    );
}
