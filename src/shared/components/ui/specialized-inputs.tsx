"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { IconButton } from "@/shared/components/ui/button"
import { Input, type InputProps } from "@/shared/components/ui/input"

type PasswordInputProps = Omit<InputProps, "type"> & {
  showLabel?: string
  hideLabel?: string
}

function PasswordInput({ className, showLabel = "Afficher le mot de passe", hideLabel = "Masquer le mot de passe", ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const toggleVisibility = () => {
    const input = inputRef.current
    const selection = input ? [input.selectionStart, input.selectionEnd] as const : null
    setVisible((current) => !current)
    requestAnimationFrame(() => {
      input?.focus()
      if (selection && selection[0] !== null && selection[1] !== null) input?.setSelectionRange(selection[0], selection[1])
    })
  }

  return (
    <div data-slot="password-input" className="relative">
      <Input ref={inputRef} type={visible ? "text" : "password"} className={cn("pr-12", className)} {...props} />
      <IconButton
        label={visible ? hideLabel : showLabel}
        size="compact"
        onClick={toggleVisibility}
        className="absolute top-1/2 right-0 -translate-y-1/2"
      >
        {visible ? <EyeOff /> : <Eye />}
      </IconButton>
    </div>
  )
}

type NumberInputProps = Omit<InputProps, "type" | "inputMode" | "onChange"> & {
  decimal?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onValueChange?: (rawValue: string, normalizedValue: number | null) => void
}

type UnitInputProps = NumberInputProps & {
  unit: string
}

function NumberInput({ className, decimal = true, onChange, onValueChange, ...props }: NumberInputProps) {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange?.(event)
    const rawValue = event.currentTarget.value
    const normalized = rawValue.trim().replace(",", ".")
    const valid = decimal ? /^[-+]?\d*(?:\.\d*)?$/.test(normalized) : /^[-+]?\d*$/.test(normalized)
    const parsed = valid && normalized !== "" && normalized !== "+" && normalized !== "-" ? Number(normalized) : null
    onValueChange?.(rawValue, parsed !== null && Number.isFinite(parsed) ? parsed : null)
  }

  return (
    <Input
      type="text"
      inputMode={decimal ? "decimal" : "numeric"}
      className={cn("tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none", className)}
      onChange={handleChange}
      {...props}
    />
  )
}

function UnitInput({ unit, className, ...props }: UnitInputProps) {
  return (
    <div data-slot="unit-input" className="relative">
      <NumberInput className={cn("pr-16", className)} {...props} />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-px right-px flex min-w-12 items-center justify-center rounded-r-[calc(var(--shape-control)-1px)] border-l bg-muted/45 px-3 text-xs font-semibold text-muted-foreground"
      >
        {unit}
      </span>
    </div>
  )
}

export { NumberInput, PasswordInput, UnitInput, type NumberInputProps, type PasswordInputProps, type UnitInputProps }
