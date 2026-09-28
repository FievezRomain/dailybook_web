"use client";

import * as React from "react";
import { CalendarDays, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Input } from "./input";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";

type FieldErrorItem = {
  fieldId: string;
  message: string;
};

type DateTimeInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "size" | "type"
> & {
  onValueChange?: (value: string) => void;
  size?: "compact" | "comfortable";
};

const stringValue = (value: React.ComponentProps<typeof Input>["value"]) =>
  typeof value === "string" ? value : "";
const parseDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : undefined;
const formatDate = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
const formatTime = (hour: number, minute: number) =>
  `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

function DateInput({
  className,
  defaultValue,
  disabled,
  onChange,
  onClick,
  onKeyDown,
  onValueChange,
  size = "compact",
  value,
  ...props
}: DateTimeInputProps) {
  const [open, setOpen] = React.useState(false);
  const [localValue, setLocalValue] = React.useState(stringValue(defaultValue));
  const inputRef = React.useRef<HTMLInputElement>(null);
  const id = React.useId();
  const currentValue = value === undefined ? localValue : stringValue(value);
  const updateValue = (nextValue: string) => {
    if (value === undefined) setLocalValue(nextValue);
    onValueChange?.(nextValue);
  };
  const chooseValue = (nextValue: string) => {
    const input = inputRef.current;
    if (!input) {
      updateValue(nextValue);
      return;
    }
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    valueSetter?.call(input, nextValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div data-slot="date-input" className="relative min-w-36">
          <Input
            ref={inputRef}
            type="date"
            disabled={disabled}
            value={currentValue}
            aria-controls={open ? id : undefined}
            aria-expanded={open}
            aria-haspopup="dialog"
            onClick={(event) => {
              setOpen(true);
              onClick?.(event);
            }}
            onChange={(event) => {
              updateValue(event.target.value);
              onChange?.(event);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
              onKeyDown?.(event);
            }}
            className={cn(
              "cursor-pointer rounded-surface border-foreground/60 bg-card pl-3 pr-12 text-[13px] tabular-nums disabled:border-border disabled:bg-muted disabled:opacity-100 [&::-webkit-calendar-picker-indicator]:pointer-events-none [&::-webkit-calendar-picker-indicator]:opacity-0",
              size === "comfortable" ? "h-12" : "h-10",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            disabled={disabled}
            aria-label="Choisir une date"
            aria-controls={open ? id : undefined}
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-[10px] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed"
          >
            <CalendarDays aria-hidden="true" className="size-[18px]" />
          </button>
        </div>
      </PopoverAnchor>
      <PopoverContent
        id={id}
        role="dialog"
        aria-label="Choisir une date"
        align="start"
        collisionPadding={16}
        className="max-h-[calc(100vh-2rem)] w-auto! max-w-[calc(100vw-2rem)] overflow-y-auto p-1"
        onEscapeKeyDown={() => setOpen(false)}
      >
        <Calendar
          mode="single"
          defaultMonth={parseDate(currentValue)}
          style={{ "--cell-size": "1.5rem" } as React.CSSProperties}
          className="p-1 text-xs [&_.rdp-month]:gap-2 [&_.rdp-week]:mt-1 [&_.rdp-weekday]:text-[10px]"
          classNames={{ day_button: "text-[11px]" }}
          selected={parseDate(currentValue)}
          onSelect={(nextDate) => {
            if (!nextDate) return;
            chooseValue(formatDate(nextDate));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function TimeInput({
  className,
  defaultValue,
  disabled,
  onChange,
  onClick,
  onKeyDown,
  onValueChange,
  size = "compact",
  value,
  ...props
}: DateTimeInputProps) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"manual" | "picker">("picker");
  const [localValue, setLocalValue] = React.useState(stringValue(defaultValue));
  const inputRef = React.useRef<HTMLInputElement>(null);
  const id = React.useId();
  const currentValue = value === undefined ? localValue : stringValue(value);
  const [hour = "00", minute = "00"] = currentValue.split(":");
  const updateValue = (nextValue: string) => {
    if (value === undefined) setLocalValue(nextValue);
    onValueChange?.(nextValue);
  };
  const commit = (nextHour: number, nextMinute: number) => {
    const nextValue = formatTime(nextHour, nextMinute);
    const input = inputRef.current;
    if (!input) {
      updateValue(nextValue);
      return;
    }
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    valueSetter?.call(input, nextValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div data-slot="time-input" className="relative min-w-30">
          <Input
            ref={inputRef}
            type="time"
            disabled={disabled}
            value={currentValue}
            aria-controls={open ? id : undefined}
            aria-expanded={open}
            aria-haspopup="dialog"
            onClick={(event) => {
              setOpen(true);
              onClick?.(event);
            }}
            onChange={(event) => {
              updateValue(event.target.value);
              onChange?.(event);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
              if (event.key === "Enter" && event.currentTarget.validity.valid)
                setOpen(false);
              onKeyDown?.(event);
            }}
            className={cn(
              "cursor-pointer rounded-surface border-foreground/60 bg-card pl-3 pr-12 text-[13px] tabular-nums disabled:border-border disabled:bg-muted disabled:opacity-100 [&::-webkit-calendar-picker-indicator]:pointer-events-none [&::-webkit-calendar-picker-indicator]:opacity-0",
              size === "comfortable" ? "h-12" : "h-10",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            disabled={disabled}
            aria-label="Choisir une heure"
            aria-controls={open ? id : undefined}
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-[10px] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed"
          >
            <Clock aria-hidden="true" className="size-[18px]" />
          </button>
        </div>
      </PopoverAnchor>
      <PopoverContent
        id={id}
        role="dialog"
        aria-label="Choisir une heure"
        align="end"
        className="w-72 p-3"
        onEscapeKeyDown={() => setOpen(false)}
      >
        <div className="mb-2 grid grid-cols-2 gap-1 rounded-surface bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={cn(
              "rounded-[9px] px-2.5 py-1.5 text-[10px]",
              mode === "manual" &&
                "bg-primary font-bold text-primary-foreground",
            )}
          >
            Saisie
          </button>
          <button
            type="button"
            onClick={() => setMode("picker")}
            className={cn(
              "rounded-[9px] px-2.5 py-1.5 text-[10px]",
              mode === "picker" &&
                "bg-primary font-bold text-primary-foreground",
            )}
          >
            Sélecteur
          </button>
        </div>
        {mode === "picker" ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="mb-1 text-[10px] font-bold text-muted-foreground">
                Heure
              </p>
              <div className="grid max-h-32 gap-1 overflow-y-auto">
                {Array.from({ length: 24 }, (_, item) => item).map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={Number(hour) === item}
                    onClick={() => commit(item, Number(minute))}
                    className="h-8 rounded-[10px] bg-muted text-xs aria-pressed:bg-primary aria-pressed:font-bold aria-pressed:text-primary-foreground"
                  >
                    {String(item).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold text-muted-foreground">
                Minute
              </p>
              <div className="grid gap-1">
                {[0, 15, 30, 45].map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={Number(minute) === item}
                    onClick={() => commit(Number(hour), item)}
                    className="h-8 rounded-[10px] bg-muted text-xs aria-pressed:bg-primary aria-pressed:font-bold aria-pressed:text-primary-foreground"
                  >
                    {String(item).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <label className="text-[10px] font-bold text-muted-foreground">
              Heure
              <Input
                aria-label="Heure"
                type="number"
                min={0}
                max={23}
                value={hour}
                onChange={(event) =>
                  commit(
                    Math.min(23, Math.max(0, Number(event.target.value))),
                    Number(minute),
                  )
                }
                className="mt-1 h-10 text-center"
              />
            </label>
            <span className="pb-2 font-bold">:</span>
            <label className="text-[10px] font-bold text-muted-foreground">
              Minute
              <Input
                aria-label="Minute"
                type="number"
                min={0}
                max={59}
                value={minute}
                onChange={(event) =>
                  commit(
                    Number(hour),
                    Math.min(59, Math.max(0, Number(event.target.value))),
                  )
                }
                className="mt-1 h-10 text-center"
              />
            </label>
          </div>
        )}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              const now = new Date();
              commit(now.getHours(), now.getMinutes());
            }}
          >
            Maintenant
          </Button>
          <Button type="button" size="sm" onClick={() => setOpen(false)}>
            Terminer
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FormErrorSummary({
  className,
  errors,
  title = "Corrigez les erreurs suivantes",
}: {
  className?: string;
  errors: FieldErrorItem[];
  title?: string;
}) {
  if (!errors.length) return null;

  return (
    <section
      data-slot="form-error-summary"
      role="alert"
      className={cn(
        "rounded-overlay border border-destructive/40 bg-destructive/10 p-4 text-destructive",
        className,
      )}
    >
      <h2 className="font-semibold">{title}</h2>
      <ul className="mt-2 list-inside list-disc space-y-1">
        {errors.map((error) => (
          <li key={`${error.fieldId}-${error.message}`}>
            <a
              className="font-medium underline underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              href={`#${error.fieldId}`}
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export {
  DateInput,
  FormErrorSummary,
  TimeInput,
  type DateTimeInputProps,
  type FieldErrorItem,
};
