import NextLink from 'next/link'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const textLinkVariants = cva(
  'inline-flex items-center gap-1 rounded-sm font-semibold underline-offset-4 transition-[color,box-shadow] duration-[var(--motion-fast)] ease-[var(--ease-standard)] hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
  {
    variants: {
      variant: {
        navigation: 'text-foreground visited:text-muted-foreground hover:text-primary active:text-primary/80',
        action: 'text-primary hover:text-primary/80 active:text-primary/70',
        destructive: 'text-destructive hover:text-destructive/80 active:text-destructive/70',
      },
    },
    defaultVariants: { variant: 'action' },
  },
)

type TextLinkProps = Omit<React.ComponentProps<'a'>, 'href'> & VariantProps<typeof textLinkVariants> & {
  href: string
  external?: boolean
}

function TextLink({ className, variant, external = false, target, rel, ...props }: TextLinkProps) {
  const classes = cn(textLinkVariants({ variant }), className)

  if (external) {
    return <a className={classes} target={target ?? '_blank'} rel={rel ?? 'noopener noreferrer'} {...props} />
  }

  return <NextLink className={classes} {...props} />
}

export { TextLink, textLinkVariants }
