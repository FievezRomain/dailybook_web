"use client";

import * as React from "react";
import { CalendarRange } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";

type DateRangeInputProps = {
  className?: string;
  disabled?: boolean;
  label?: string;
  onValueChange: (value: DateRange) => void;
  size?: "compact" | "comfortable";
  value: DateRange;
};

const formatDate = (value?: Date) =>
  value
    ? value.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "JJ/MM/AAAA";
const addDays = (value: Date, days: number) => {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
};
const dayStart = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

function DateRangeInput({
  className,
  disabled = false,
  label = "Plage de dates",
  onValueChange,
  size = "compact",
  value,
}: DateRangeInputProps) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  const errorId = `${id}-error`;
  const invalid = Boolean(value.from && value.to && value.from > value.to);
  const duration =
    value.from && value.to && !invalid
      ? Math.round(
          (dayStart(value.to).getTime() - dayStart(value.from).getTime()) /
            86_400_000,
        ) + 1
      : undefined;

  function applyPreset(kind: "week" | "month30" | "currentMonth") {
    const today = dayStart(new Date());
    if (kind === "currentMonth") {
      onValueChange({
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: new Date(today.getFullYear(), today.getMonth() + 1, 0),
      });
      return;
    }
    onValueChange({
      from: today,
      to: addDays(today, kind === "week" ? 6 : 29),
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div data-slot="date-range-input" className={cn("relative", className)}>
          <button
            type="button"
            disabled={disabled}
            aria-label={label}
            aria-controls={open ? id : undefined}
            aria-describedby={invalid ? errorId : undefined}
            aria-expanded={open}
            aria-haspopup="dialog"
            data-invalid={invalid || undefined}
            onClick={() => setOpen((current) => !current)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-surface border border-foreground/60 bg-card px-3 text-left outline-none transition-[color,box-shadow] hover:border-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[invalid=true]:border-destructive data-[invalid=true]:bg-destructive/10 disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground",
              size === "comfortable" ? "h-[52px]" : "h-11",
            )}
          >
            <CalendarRange
              aria-hidden="true"
              className="size-[18px] shrink-0 text-muted-foreground"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[9px] font-bold text-muted-foreground">
                Début
              </span>
              <span className="block truncate text-xs tabular-nums">
                {formatDate(value.from)}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="text-[15px] font-bold text-muted-foreground"
            >
              →
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[9px] font-bold text-muted-foreground">
                Fin
              </span>
              <span
                className={cn(
                  "block truncate text-xs tabular-nums",
                  invalid && "text-destructive",
                )}
              >
                {formatDate(value.to)}
              </span>
            </span>
            <span className="shrink-0 rounded-[9px] bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">
              {duration ? `${duration} j` : "—"}
            </span>
          </button>
          {invalid && (
            <p id={errorId} role="alert" className="sr-only">
              La date de fin doit être postérieure ou égale à la date de début.
            </p>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        id={id}
        role="dialog"
        aria-label={`Sélectionner ${label.toLocaleLowerCase("fr-FR")}`}
        align="start"
        collisionPadding={16}
        className="max-h-[calc(100vh-2rem)] w-auto! max-w-[calc(100vw-2rem)] overflow-y-auto p-2"
        onEscapeKeyDown={() => setOpen(false)}
      >
        <div className="mb-2 flex flex-wrap gap-1.5">
          <Button type="button" size="sm" onClick={() => applyPreset("week")}>
            7 jours
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => applyPreset("month30")}
          >
            30 jours
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => applyPreset("currentMonth")}
          >
            Ce mois
          </Button>
        </div>
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={value}
          onSelect={(nextValue) =>
            onValueChange(nextValue ?? { from: undefined })
          }
          className="rounded-surface bg-muted/50 p-1 [--cell-size:--spacing(6)]"
        />
        <Button
          type="button"
          size="sm"
          className="mt-2 w-full"
          onClick={() => setOpen(false)}
        >
          Terminer
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export { DateRangeInput, type DateRangeInputProps };
