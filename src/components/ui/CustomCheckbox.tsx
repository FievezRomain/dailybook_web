import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => void;
}

export function CustomCheckbox({ checked, onChange }: CustomCheckboxProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "w-6 h-6 flex items-center justify-center rounded-sm border transition-all duration-200 cursor-pointer",
        checked
          ? "bg-foreground border-foreground hover:bg-foreground/90"
          : "bg-background border-muted-foreground hover:border-foreground"
      )}
      aria-pressed={checked}
      aria-label="Marquer comme complété"
    >
      {checked && <Check className="w-4 h-4 text-background transition-transform duration-200 scale-100" />}
    </button>
  );
}
