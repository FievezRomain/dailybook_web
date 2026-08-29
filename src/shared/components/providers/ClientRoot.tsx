"use client";
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/shared/components/ui/sonner';
import { QueryProvider } from './QueryProvider';
import { PremiumDialogProvider } from '@/shared/components/feedback/PremiumGate';

export default function ClientRoot({ children, nonce }: { children: React.ReactNode; nonce?: string }) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem nonce={nonce}>
          <Toaster />
          <PremiumDialogProvider>{children}</PremiumDialogProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
