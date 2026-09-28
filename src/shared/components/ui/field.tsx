import * as React from "react"

import { cn } from "@/lib/utils"

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field" className={cn("grid gap-2", className)} {...props} />
}

function FieldLabel({ className, required, children, ...props }: React.ComponentProps<"label"> & { required?: boolean }) {
  return <label data-slot="field-label" className={cn("text-sm font-semibold", className)} {...props}>{children}{required && <span aria-hidden="true">&nbsp;*</span>}</label>
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="field-description" className={cn("text-xs leading-[17px] text-muted-foreground", className)} {...props} />
}

function FieldError({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="field-error" role="alert" className={cn("text-xs leading-[17px] font-medium text-destructive", className)} {...props} />
}

function FieldMeta({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-meta" className={cn("flex items-start justify-between gap-3", className)} {...props} />
}

function FieldCounter({ className, current, max, ...props }: Omit<React.ComponentProps<"span">, "children"> & { current: number; max: number }) {
  return <span data-slot="field-counter" className={cn("ml-auto shrink-0 text-xs tabular-nums text-muted-foreground", className)} {...props}>{current}/{max}</span>
}

export { Field, FieldLabel, FieldDescription, FieldError, FieldMeta, FieldCounter }
