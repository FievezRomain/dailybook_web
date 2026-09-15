import { Banknote, CalendarPlus, ContactRound, Gift, NotebookPen, PawPrint, Plus, Target, UsersRound } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { type ReactNode, useState } from "react";
import { useCurrentUser } from '@/features/user/hooks/use-current-user';
import { useEventFormDrawer } from "@/features/events/context/event-form-drawer-context";
import { getLocalDateString } from "@/shared/utils/dates";
import { useAnimalFormDrawer } from "@/features/animals/context/animal-form-drawer-context";
import { useObjectiveFormDrawer } from '@/features/objectives/context/objective-form-drawer-context';
import { useRouter } from 'next/navigation';
import { usePremiumDialog } from '@/shared/components/feedback/PremiumGate';
import { cn } from '@/lib/utils';

type CreateAction = {
  label: string;
  description: string;
  icon: ReactNode;
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
  const router = useRouter();
  const { user, isPremium } = useCurrentUser();
  const { openPremiumDialog } = usePremiumDialog();

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
    router.push('/notes?create=1');
  }
  function onCreateContact() {
    router.push('/contacts?create=1');
  }
  function onCreateWish() {
    router.push('/wishes?create=1');
  }
  function onCreateGroup() {
    if (isPremium) router.push('/groups?create=1');
    else openPremiumDialog('groupManagement');
  }

  const actions: CreateAction[] = [
    { label: 'Événement', description: 'Rendez-vous, soin ou activité', icon: <CalendarPlus className="size-5" />, onClick: () => onCreateEvent() },
    {
      label: 'Animal',
      description: 'Nouvelle fiche animale',
      icon: <PawPrint className="size-5" />,
      onClick: onCreateAnimal,
    },
    {
      label: 'Objectif',
      description: 'Un cap et ses prochaines étapes',
      icon: <Target className="size-5" />,
      onClick: () => openObjectiveDrawer(),
    },
    {
      label: 'Note',
      description: 'Information rapide',
      icon: <NotebookPen className="size-5" />,
      onClick: onCreateNote,
    },
    {
      label: 'Contact',
      description: 'Personne ou professionnel utile',
      icon: <ContactRound className="size-5" />,
      onClick: onCreateContact,
    },
    {
      label: 'Souhait',
      description: 'Une envie à garder en vue',
      icon: <Gift className="size-5" />,
      onClick: onCreateWish,
    },
    {
      label: 'Dépense',
      description: 'Suivi d’un montant',
      icon: <Banknote className="size-5" />,
      onClick: () => onCreateEvent('depense'),
    },
    {
      label: 'Groupe',
      description: 'Coordination partagée',
      icon: <UsersRound className="size-5" />,
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
            <Plus
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
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary">{action.icon}</span>
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
