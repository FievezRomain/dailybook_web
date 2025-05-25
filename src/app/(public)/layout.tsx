import { ThemeContextProvider } from '@/context/ThemeContext';
import '@/app/globals.scss'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <ThemeContextProvider forceSystem>{children}</ThemeContextProvider>;
}
