import * as React from 'react'

import { cn } from '@/lib/utils'

type ContentHeaderProps = Omit<React.ComponentProps<'header'>, 'title'> & {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
}

export function ContentHeader({ title, description, actions, className, ...props }: ContentHeaderProps) {
  return (
    <header className={cn('flex min-h-11 flex-wrap items-center gap-x-4 gap-y-2', className)} {...props}>
      <div className="min-w-0 flex-1">
        <h1 data-page-title tabIndex={-1} className="rounded-sm text-page-title font-bold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
          {title}
        </h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div> : null}
    </header>
  )
}
