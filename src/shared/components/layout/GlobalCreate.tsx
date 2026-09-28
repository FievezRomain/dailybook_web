import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { useState } from "react";
import { useCurrentUser } from '@/features/user/hooks/use-current-user';
import { useEventFormDrawer } from "@/features/events/context/event-form-drawer-context";
import { getLocalDateString } from "@/shared/utils/dates";
import { useAnimalFormDrawer } from "@/features/animals/context/animal-form-drawer-context";
import { useObjectiveFormDrawer } from '@/features/objectives/context/objective-form-drawer-context';
import { usePremiumDialog } from '@/shared/components/feedback/PremiumGate';
import { useGlobalCreate } from '@/shared/components/providers/GlobalCreateProvider';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from '@/shared/components/ui/icons';

type CreateAction = {
  label: string;
  description: string;
  icon: IconName;
  onClick: () => void;
  premium?: boolean;
};

type GlobalCreateProps = {
  hideOnPaths?: string[];
  currentPath: string;
  expanded?: boolean;
  placement?: 'rail' | 'topbar';
};

export function GlobalCreate({
  hideOnPaths = [],
  currentPath,
  expanded = false,
  placement = 'rail',
}: GlobalCreateProps) {
  const [open, setOpen] = useState(false);
  const { user, isPremium } = useCurrentUser();
  const { openPremiumDialog } = usePremiumDialog();
  const { openEntityForm } = useGlobalCreate();

  // Utilise le context pour ouvrir le formulaire
  const { openDrawer } = useEventFormDrawer();
  const { openDrawer: openAnimalDrawer } = useAnimalFormDrawer();
  const { openDrawer: openObjectiveDrawer } = useObjectiveFormDrawer();

  // Fonctions de création
  function onCreateEvent(type = 'autre') {
    openDrawer({ initialEvent: { eventtype: type, todisplay: true, dateevent: getLocalDateString() } });
  }
  function onCreateAnimal() {
    openAnimalDrawer({ initialAnimal: { datenaissance: getLocalDateString(), email: user?.email } });
  }
  function onCreateNote() {
    openEntityForm('note');
  }
  function onCreateContact() {
    openEntityForm('contact');
  }
  function onCreateWish() {
    openEntityForm('wish');
  }
  function onCreateGroup() {
    if (isPremium) openEntityForm('group');
    else openPremiumDialog('groupManagement');
  }

  const actions: CreateAction[] = [
    { label: 'Événement', description: 'Planifier un soin, une balade ou un rendez-vous', icon: 'event', onClick: () => onCreateEvent() },
    {
      label: 'Animal',
      description: 'Ajouter un nouveau compagnon et son profil',
      icon: 'animals',
      onClick: onCreateAnimal,
    },
    {
      label: 'Objectif',
      description: 'Définir un suivi avec une échéance et des étapes',
      icon: 'objective',
      onClick: () => openObjectiveDrawer(),
    },
    {
      label: 'Note',
      description: 'Écrire rapidement ou enregistrer avec la voix',
      icon: 'note',
      onClick: onCreateNote,
    },
    {
      label: 'Contact',
      description: 'Enregistrer une personne et ses informations utiles',
      icon: 'contact',
      onClick: onCreateContact,
    },
    {
      label: 'Souhait',
      description: 'Garder une idée avec son prix éventuel',
      icon: 'heart',
      onClick: onCreateWish,
    },
    {
      label: 'Groupe',
      description: 'Créer un espace partagé pour vos proches et animaux',
      icon: 'group',
      onClick: onCreateGroup,
      premium: true,
    },
  ];

  if (hideOnPaths.some((path) => currentPath.startsWith(path)))
    return null;

  return (
    <>
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
            className={cn(
              'z-50 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-overlay hover:bg-primary/90',
              expanded ? 'h-12 w-full rounded-control px-5' : placement === 'topbar' ? 'size-10 p-0 md:hidden' : 'size-12 rounded-full p-0',
            )}
            aria-label="Créer"
            variant="default"
            >
            <Icon
                name="add"
                className={`size-5 transition-transform duration-[var(--motion-base)] motion-reduce:transition-none ${
                open ? "rotate-45" : ""
                }`}
            />
            {expanded && <span className="font-semibold">Créer</span>}
            </Button>
        </PopoverTrigger>
        <PopoverContent
            align="end"
            side={placement === 'topbar' ? 'bottom' : 'top'}
            size="regular"
            className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto p-5"
        >
          <div><h2 className="text-xl font-semibold">Créer</h2><p className="mt-1 text-xs text-muted-foreground">Que souhaitez-vous ajouter ?</p></div>
          <div className="grid gap-1">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant="ghost"
                className="h-auto min-h-14 w-full justify-start gap-3 whitespace-normal px-2 py-2 text-left"
                onClick={() => {
                  setOpen(false);
                  action.onClick();
                }}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary"><Icon name={action.icon} className="size-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold text-foreground">{action.label}</span><span className="block text-[11px] font-normal text-muted-foreground">{action.description}</span></span>
                {action.premium && <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-primary">Premium</span>}
              </Button>
            ))}
          </div>
        </PopoverContent>
        </Popover>
    </>
  );
}
