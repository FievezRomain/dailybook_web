import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ReactNode, useState } from "react";

type FloatingAction = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
};

type FloatingActionsProps = {
  actions: FloatingAction[];
  hideOnPaths?: string[];
  currentPath: string;
  show?: boolean;
};

export function FloatingActions({
  actions,
  hideOnPaths = [],
  currentPath,
  show = true,
}: FloatingActionsProps) {
  const [open, setOpen] = useState(false);

  // Masque le FAB sur les pages à exclure
  if (!show || hideOnPaths.some((path) => currentPath.startsWith(path)))
    return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:bg-primary/90 transition"
          aria-label="Ajouter"
          variant="default"
        >
          <Plus
            className={`w-8 h-8 transition-transform duration-300 ${
              open ? "rotate-45" : ""
            }`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        className="flex flex-col gap-2 w-56"
      >
        {actions.map((action, i) => (
          <Button
            key={i}
            variant="outline"
            className="flex items-center gap-2 justify-start"
            onClick={() => {
              setOpen(false);
              action.onClick();
            }}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}