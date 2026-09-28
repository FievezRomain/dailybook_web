import { Search, X } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { Input, type InputProps } from './input'

type SearchFieldProps = Omit<InputProps, 'type'> & {
  label: string
  error?: string
  containerClassName?: string
  onClear?: () => void
}

const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { id: providedId, label, error, className, containerClassName, onClear, 'aria-describedby': describedBy, ...props },
  ref,
) {
  const generatedId = React.useId()
  const id = providedId ?? `search-${generatedId}`
  const errorId = `${id}-error`
  const descriptionIds = [describedBy, error ? errorId : undefined].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('grid w-full max-w-xl gap-1.5', containerClassName)}>
      <div className="relative">
        <label className="sr-only" htmlFor={id}>{label}</label>
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
          className={cn('pl-10!', onClear && 'pr-10! [&::-webkit-search-cancel-button]:appearance-none', className)}
        />
        {onClear && typeof props.value === 'string' && props.value.length > 0 ? (
          <button
            type="button"
            aria-label="Effacer la recherche"
            onClick={onClear}
            className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>
      {error ? <p id={errorId} className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
})

export { SearchField, type SearchFieldProps }
