import ResponsiveAppBar from '@/components/ResponsiveAppBar';
import { ThemeContextProvider } from '@/context/ThemeContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
        <ThemeContextProvider>
            <ResponsiveAppBar />
            {children}
        </ThemeContextProvider>
    );
}
