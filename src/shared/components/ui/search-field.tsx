import { Search } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { Input, type InputProps } from './input'

type SearchFieldProps = Omit<InputProps, 'type'> & {
  label: string
  error?: string
  containerClassName?: string
}

const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { id: providedId, label, error, className, containerClassName, 'aria-describedby': describedBy, ...props },
  ref,
) {
  const generatedId = React.useId()
  const id = providedId ?? `search-${generatedId}`
  const errorId = `${id}-error`
  const descriptionIds = [describedBy, error ? errorId : undefined].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('grid w-full max-w-xl gap-1.5', containerClassName)}>
      <label className="relative block" htmlFor={id}>
        <span className="sr-only">{label}</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          {...props}
          ref={ref}
          id={id}
          type="search"
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={descriptionIds}
          className={cn('pl-10!', className)}
        />
      </label>
      {error ? <p id={errorId} className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
})

export { SearchField, type SearchFieldProps }
