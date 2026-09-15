import { useEventDrawer } from "@/features/events/context/event-drawer-context";
import { EventDrawer } from "./EventDrawer";
import { useCurrentUser } from '@/features/user/hooks/use-current-user';
import { filterAnimals } from "@/features/animals/utils/animals";
import { useEventDelete } from "@/features/events/context/event-delete-context";
import { useEventFormDrawer } from "@/features/events/context/event-form-drawer-context";
import { useAnimalsQuery } from "@/features/animals/hooks/use-animals";

export function EventDrawerWrapper() {
    const { drawer, closeDrawer } = useEventDrawer();
    const { user } = useCurrentUser();
    const { animals, isLoading: isLoadingAnimals, updateAnimalImage } = useAnimalsQuery();

    // Gestion de l'ouverture du dialog pour confirmer la suppression d'un event
    const { openDelete } = useEventDelete();
    const { openDrawer: openFormDrawer } = useEventFormDrawer();

    if (!drawer.open || !drawer.event) return null;

    return (
        <EventDrawer
            open={drawer.open}
            onClose={closeDrawer}
            event={drawer.event}
            animals={isLoadingAnimals || !user || !animals ? undefined : filterAnimals(drawer.event, animals)}
            onEdit={() => { openFormDrawer({ initialEvent: drawer.event! }); closeDrawer(); }}
            onDelete={() => {openDelete(drawer.event!); closeDrawer();}}
            onUpdateAnimalImage={updateAnimalImage}
        />
    );
}
