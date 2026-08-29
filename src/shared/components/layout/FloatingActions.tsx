import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { type ReactNode, useState } from "react";
import { iconsMap, titleMap } from "@/features/events/utils/events";
import { FaUserPlus, FaRegStickyNote, FaUsers, FaBullseye, FaStar } from "react-icons/fa";
import { PawPrint } from "lucide-react";
import { useCurrentUser } from '@/features/user/hooks/use-current-user';
import { useEventFormDrawer } from "@/features/events/context/event-form-drawer-context";
import React from "react";
import { getLocalDateString } from "@/shared/utils/dates";
import { useAnimalFormDrawer } from "@/features/animals/context/animal-form-drawer-context";
import { useObjectiveFormDrawer } from "@/features/objectives/context/objective-form-drawer-context";
import { useRouter } from 'next/navigation';
import { usePremiumDialog } from '@/shared/components/feedback/PremiumGate';

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
  const router = useRouter();
  const { user, isPremium } = useCurrentUser();
  const { openPremiumDialog } = usePremiumDialog();

  // Utilise le context pour ouvrir le formulaire
  const { openDrawer } = useEventFormDrawer();
  const { openDrawer: openAnimalDrawer } = useAnimalFormDrawer();
  const { openDrawer: openObjectiveDrawer } = useObjectiveFormDrawer();

  // Fonctions de création
  function onCreateEvent(type: string) {
    openDrawer({ initialEvent: { eventtype: type, todisplay: true, dateevent: getLocalDateString() } });
  }
  function onCreateAnimal() {
    openAnimalDrawer({ initialAnimal: { datenaissance: getLocalDateString(), email: user?.email } });
  }
  function onCreateContact() {
    alert("Créer un contact");
  }
  function onCreateWish() {
    router.push('/wishes?create=1');
  }
  function onCreateNote() {
    router.push('/notes?create=1');
  }
  function onCreateObjective() {
    openObjectiveDrawer({ initialObjective: { datedebut: getLocalDateString(), datefin: getLocalDateString() } });
  }
  function onCreateGroup() {
    if (isPremium) router.push('/groups');
    else openPremiumDialog('groupManagement');
  }

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
      onClick: onCreateGroup,
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
