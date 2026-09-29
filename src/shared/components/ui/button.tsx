import * as React from "react";
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { LoaderCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-control whitespace-nowrap rounded-control font-semibold transition-[background-color,color,border-color,box-shadow,transform] duration-[var(--motion-fast)] ease-[var(--ease-standard)] disabled:pointer-events-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer active:scale-[.98] motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/30",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-card text-primary shadow-xs hover:bg-muted",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 text-[13px] has-[>svg]:px-2.5",
        lg: "h-12 px-5 text-[15px] has-[>svg]:px-4",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const iconButtonVariants = cva(
  "relative inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none transition-transform duration-[var(--motion-fast)] ease-[var(--ease-standard)] after:absolute after:rounded-full after:transition-[background-color,color,box-shadow] after:duration-[var(--motion-fast)] after:content-[''] hover:after:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[.96] disabled:pointer-events-none disabled:cursor-not-allowed disabled:text-muted-foreground disabled:after:bg-muted motion-reduce:active:scale-100 [&_svg]:relative [&_svg]:z-10",
  {
    variants: {
      variant: {
        default: "text-primary-foreground after:bg-primary hover:after:bg-primary/90",
        secondary: "text-primary after:bg-card after:shadow-xs",
        ghost: "text-foreground after:bg-transparent",
        destructive: "text-destructive-foreground after:bg-destructive hover:after:bg-destructive/90",
      },
      size: {
        compact: "after:inset-1.5 [&_svg]:size-4",
        default: "after:inset-0.5 [&_svg]:size-5",
        large: "size-12 after:inset-0 [&_svg]:size-6",
      },
    },
    defaultVariants: { variant: "ghost", size: "default" },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  disabled = false,
  onClick,
  tabIndex,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
}) {
  const Comp = asChild ? Slot : "button"
  const isDisabled = loading || disabled

  const handleClick: React.MouseEventHandler<HTMLButtonElement> | undefined = asChild && isDisabled
    ? (event) => {
      event.preventDefault()
      event.stopPropagation()
    }
    : onClick

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
      onClick={handleClick}
      aria-busy={loading || undefined}
      aria-disabled={asChild && isDisabled ? true : undefined}
      disabled={asChild ? undefined : isDisabled}
      tabIndex={asChild && isDisabled ? -1 : tabIndex}
    >
      {loading && !asChild ? <><LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" /><span className="sr-only">{children}</span></> : children}
    </Comp>
  )
}

function IconButton({
  label,
  className,
  variant,
  size,
  loading = false,
  disabled = false,
  children,
  ...props
}: Omit<React.ComponentProps<"button">, "aria-label"> & VariantProps<typeof iconButtonVariants> & {
  label: string
  loading?: boolean
}) {
  return (
    <button
      type="button"
      data-slot="icon-button"
      data-size={size ?? "default"}
      aria-label={label}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : children}
    </button>
  )
}

export { Button, IconButton, buttonVariants, iconButtonVariants }
