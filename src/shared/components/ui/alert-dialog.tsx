"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { CircleHelp, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/shared/components/ui/button"

type AlertDialogTone = "confirm" | "destructive"

function AlertDialog(props: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger(props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal(props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-scrim duration-[var(--motion-base)] motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  children,
  tone = "confirm",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content> & { tone?: AlertDialogTone }) {
  const Icon = tone === "destructive" ? TriangleAlert : CircleHelp

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-tone={tone}
        className={cn(
          "bg-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid w-[460px] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[18px] border p-[22px] shadow-overlay duration-[var(--motion-base)] motion-reduce:animate-none data-[tone=destructive]:border-foreground/50",
          className,
        )}
        {...props}
      >
        <div
          aria-hidden="true"
          className="absolute top-[22px] left-[22px] grid size-[38px] place-items-center rounded-full bg-muted text-foreground data-[tone=destructive]:bg-destructive/10 data-[tone=destructive]:text-destructive"
          data-tone={tone}
        >
          <Icon className="size-5" />
        </div>
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("grid min-h-[38px] gap-[5px] pl-[50px] text-left", className)} {...props} />
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-footer" className={cn("flex flex-row justify-end gap-[10px]", className)} {...props} />
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn("text-[18px] leading-[26px] font-semibold", className)} {...props} />
}

function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return <AlertDialogPrimitive.Description data-slot="alert-dialog-description" className={cn("text-muted-foreground text-xs leading-[17px]", className)} {...props} />
}

function AlertDialogConsequence({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-consequence" className={cn("rounded-[10px] border bg-muted px-3 py-[10px] text-xs leading-[17px] text-muted-foreground", className)} {...props} />
}

function AlertDialogAction({ className, tone = "confirm", ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Action> & { tone?: AlertDialogTone }) {
  return <AlertDialogPrimitive.Action data-slot="alert-dialog-action" className={cn(buttonVariants({ variant: tone === "destructive" ? "destructive" : "default" }), className)} {...props} />
}

function AlertDialogCancel({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" className={cn(buttonVariants({ variant: "secondary" }), className)} {...props} />
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogConsequence,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
