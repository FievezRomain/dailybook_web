import * as React from 'react'

import { cn } from '@/lib/utils'

export function MasonryGrid({ children, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('columns-1 gap-4 sm:columns-2 xl:columns-3', className)} {...props}>
      {React.Children.toArray(children).map((child, index) => (
        <div key={React.isValidElement(child) && child.key != null ? child.key : index} className="mb-4 break-inside-avoid-column">
          {child}
        </div>
      ))}
    </div>
  )
}
