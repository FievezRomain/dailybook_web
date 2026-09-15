import * as React from "react";

import { cn } from "@/lib/utils"

type TextareaProps = React.ComponentProps<"textarea"> & {
  size?: "compact" | "default" | "large"
}

function Textarea({ className, size = "compact", ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      data-size={size}
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex w-full resize-y rounded-control border bg-card p-3 transition-[color,background-color,border-color,box-shadow] duration-[var(--motion-fast)] outline-none hover:border-foreground/60 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground read-only:border-border read-only:bg-muted [@media(pointer:coarse)]:resize-none",
        "data-[size=compact]:h-24 data-[size=compact]:text-[13px] data-[size=default]:h-[120px] data-[size=default]:text-sm data-[size=large]:h-40 data-[size=large]:px-4 data-[size=large]:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea, type TextareaProps }
