import * as React from "react";

import { cn } from "@/lib/utils"

type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  size?: "compact" | "default" | "large"
}

function Input({ className, type, size = "default", ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex w-full min-w-0 rounded-control border bg-card py-0 transition-[color,background-color,border-color,box-shadow] duration-[var(--motion-fast)] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:border-foreground/60 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground read-only:border-border read-only:bg-muted",
        "data-[size=compact]:h-8 data-[size=compact]:px-3 data-[size=compact]:text-[13px] data-[size=default]:h-10 data-[size=default]:px-3 data-[size=default]:text-sm data-[size=large]:h-12 data-[size=large]:px-4 data-[size=large]:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input, type InputProps }
