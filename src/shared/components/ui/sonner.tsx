"use client"

import { useTheme } from "next-themes"
import { CircleCheck, CircleX, Info } from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ closeButton = true, duration = 5000, toastOptions, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const { classNames, ...restToastOptions } = toastOptions ?? {}

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      closeButton={closeButton}
      duration={duration}
      richColors
      icons={{ info: <Info className="size-4" />, success: <CircleCheck className="size-4" />, error: <CircleX className="size-4" /> }}
      toastOptions={{
        ...restToastOptions,
        closeButtonAriaLabel: 'Fermer la notification',
        classNames: {
          toast: '!w-[min(420px,calc(100vw-2rem))] !rounded-[14px] !border !p-[14px]',
          title: '!text-[13px] !font-semibold',
          description: '!text-xs !text-muted-foreground',
          actionButton: '!h-8 !rounded-control !bg-primary !px-3 !text-xs !font-semibold !text-primary-foreground',
          cancelButton: '!h-8 !rounded-control !px-3 !text-xs',
          closeButton: '!size-7 !rounded-full !border-0 !bg-muted',
          ...classNames,
        },
      }}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg":
            "color-mix(in oklab, var(--palomino) 48%, var(--popover))",
          "--success-text": "var(--foreground)",
          "--success-border":
            "color-mix(in oklab, var(--baie) 48%, var(--border))",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
