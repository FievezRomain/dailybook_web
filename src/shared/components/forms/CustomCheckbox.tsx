import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  label?: string;
}

export function CustomCheckbox({ checked, onChange, disabled = false, label = 'Marquer comme complété' }: CustomCheckboxProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className="grid size-11 shrink-0 place-items-center rounded-control bg-transparent p-0 outline-none transition-transform duration-[var(--motion-fast)] focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
    >
      <span className={cn(
        "flex size-6 items-center justify-center rounded-md border-2 transition-[background-color,border-color] duration-[var(--motion-fast)]",
        checked ? "border-checkbox-checked bg-checkbox-checked" : "border-muted-foreground bg-card hover:border-checkbox-checked",
      )}>
        {checked && <Check aria-hidden="true" className="size-4 text-white" />}
      </span>
    </button>
  );
}
