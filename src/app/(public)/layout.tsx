import { ThemeContextProvider } from '@/context/ThemeContext';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <ThemeContextProvider forceSystem>{children}</ThemeContextProvider>;
}
