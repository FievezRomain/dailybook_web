import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ReactNode, useState } from "react";
import { iconsMap, titleMap } from "@/utils/eventsUtils";
import { FaUserPlus, FaRegStickyNote, FaUsers, FaBullseye, FaStar } from "react-icons/fa";
import { PawPrint } from "lucide-react";
import { useUserContext } from "@/context/UserContext";
import { useEventFormDrawer } from "@/context/EventFormDrawerContext";
import React from "react";

type FloatingAction = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
};

type FloatingActionsProps = {
  hideOnPaths?: string[];
  currentPath: string;
  show?: boolean;
};

export function FloatingActions({
  hideOnPaths = [],
  currentPath,
  show = true,
}: FloatingActionsProps) {
  const [open, setOpen] = useState(false);
  const { user } = useUserContext();
  const isPremium = user?.isPremium;

  // Utilise le context pour ouvrir le formulaire
  const { openDrawer } = useEventFormDrawer();

  // Fonctions de création
  function onCreateEvent(type: string) {
    openDrawer({ initialEvent: { eventtype: type, todisplay: true } });
  }
  function onCreateAnimal() { alert("Créer un animal"); }
  function onCreateContact() { alert("Créer un contact"); }
  function onCreateWish() { alert("Créer un souhait"); }
  function onCreateNote() { alert("Créer une note"); }
  function onCreateObjective() { alert("Créer un objectif"); }
  function onCreateGroup() { alert("Créer un groupe"); }

  const eventTypes = [
    "depense",
    "balade",
    "soins",
    "concours",
    "entrainement",
    "autre",
    "rdv",
  ];

  // Tableau d'actions typé
  const actions: FloatingAction[] = [
    ...eventTypes.map((type) => ({
      label: titleMap[type],
      icon: iconsMap[type] ? React.createElement(iconsMap[type], { className: "w-5 h-5" }) : null,
      onClick: () => onCreateEvent(type),
    })),
    {
      label: "Ajouter un animal",
      icon: <PawPrint className="w-5 h-5" />,
      onClick: onCreateAnimal,
    },
    {
      label: "Ajouter un contact",
      icon: <FaUserPlus className="w-5 h-5" />,
      onClick: onCreateContact,
    },
    {
      label: "Ajouter un souhait",
      icon: <FaStar className="w-5 h-5" />,
      onClick: onCreateWish,
    },
    {
      label: "Ajouter une note",
      icon: <FaRegStickyNote className="w-5 h-5" />,
      onClick: onCreateNote,
    },
    {
      label: "Ajouter un objectif",
      icon: <FaBullseye className="w-5 h-5" />,
      onClick: onCreateObjective,
    },
    {
      label: "Créer un groupe",
      icon: <FaUsers className="w-5 h-5" />,
      onClick: isPremium ? onCreateGroup : () => {},
      disabled: !isPremium,
      tooltip: !isPremium ? "Réservé aux membres Premium" : undefined,
    },
  ];

  // Masque le FAB sur les pages à exclure
  if (!show || hideOnPaths.some((path) => currentPath.startsWith(path)))
    return null;

  return (
    <>
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
            className={`flex flex-col gap-2 w-56 max-w-xs sm:w-72 max-h-[70vh] overflow-y-auto shadow-lg`}
        >
            {actions.map((action, i) =>
            action.label === "---separator---" ? (
                <div key={i} className="border-t my-2" />
            ) : (
                <Button
                key={i}
                variant="outline"
                className="flex items-center gap-2 justify-start"
                onClick={() => {
                    setOpen(false);
                    if (!action.disabled) action.onClick();
                }}
                disabled={action.disabled}
                title={action.tooltip}
                >
                {action.icon}
                {action.label}
                {action.tooltip && (
                    <span className="ml-2 text-xs text-muted-foreground">(Premium)</span>
                )}
                </Button>
            )
            )}
        </PopoverContent>
        </Popover>
    </>
  );
}
