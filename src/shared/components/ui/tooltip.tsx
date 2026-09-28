'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

type TooltipContextValue = {
  contentId: string
  open: boolean
  setOpen: (open: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null)

function useTooltip() {
  const context = React.useContext(TooltipContext)
  if (!context) throw new Error('TooltipTrigger et TooltipContent doivent être utilisés dans Tooltip.')
  return context
}

function TooltipProvider({ children }: React.PropsWithChildren) {
  return <>{children}</>
}

function Tooltip({ children }: React.PropsWithChildren) {
  const [open, setOpen] = React.useState(false)
  const contentId = React.useId()

  return (
    <TooltipContext.Provider value={{ contentId, open, setOpen }}>
      <span data-slot="tooltip" className="relative inline-flex" onPointerLeave={() => setOpen(false)} onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false) }}>
        {children}
      </span>
    </TooltipContext.Provider>
  )
}

function TooltipTrigger({ asChild = false, onBlur, onFocus, onPointerEnter, ...props }: React.ComponentProps<'button'> & { asChild?: boolean }) {
  const { contentId, open, setOpen } = useTooltip()
  const Component = asChild ? Slot : 'button'

  return (
    <Component
      data-slot="tooltip-trigger"
      type={asChild ? undefined : 'button'}
      aria-describedby={open ? contentId : undefined}
      onFocus={(event) => { setOpen(true); onFocus?.(event) }}
      onBlur={(event) => { setOpen(false); onBlur?.(event) }}
      onPointerEnter={(event) => { setOpen(true); onPointerEnter?.(event) }}
      {...props}
    />
  )
}

function TooltipContent({ className, children, placement = 'top', shortcut, ...props }: React.ComponentProps<'span'> & { placement?: 'top' | 'bottom'; shortcut?: string }) {
  const { contentId, open } = useTooltip()
  if (!open) return null

  return (
    <span
      data-slot="tooltip-content"
      id={contentId}
      role="tooltip"
      className={cn(
        'absolute left-1/2 z-[var(--z-index-toast)] flex w-max max-w-64 -translate-x-1/2 items-center gap-2 rounded-[8px] bg-primary px-2.5 py-[7px] text-[11px] font-semibold text-primary-foreground shadow-overlay motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95',
        placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      {shortcut && <kbd className="rounded-[5px] bg-background px-1.5 py-0.5 text-[10px] font-bold text-foreground">{shortcut}</kbd>}
    </span>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
