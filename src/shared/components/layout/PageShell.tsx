import { cn } from '@/lib/utils';

export function PageShell({ className, ...props }: React.ComponentProps<'main'>) {
  return <main className={cn('mx-auto w-full max-w-6xl space-y-section p-page-gutter', className)} {...props} />;
}

export function PageHeader({ className, ...props }: React.ComponentProps<'header'>) {
  return <header className={cn('flex flex-wrap items-start justify-between gap-surface', className)} {...props} />;
}
