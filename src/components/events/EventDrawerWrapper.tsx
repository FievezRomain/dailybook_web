import { useEventDrawer } from "@/context/EventDrawerContext";
import { EventDrawer } from "./EventDrawer";
import { useUserContext } from "@/context/UserContext";
import { filterAnimals } from "@/utils/animalsUtils";
import { useEventDelete } from "@/context/EventDeleteContext";
import { useAnimals } from "@/context/AnimalContext";

export function EventDrawerWrapper() {
    const { drawer, closeDrawer } = useEventDrawer();
    const { user } = useUserContext();
    const { animals, isLoading: isLoadingAnimals } = useAnimals();

    // Gestion de l'ouverture du dialog pour confirmer la suppression d'un event
    const { openDelete } = useEventDelete();

    if (!drawer.open || !drawer.event) return null;

    return (
        <EventDrawer
            open={drawer.open}
            onClose={closeDrawer}
            event={drawer.event}
            animals={isLoadingAnimals || !user || !animals ? undefined : filterAnimals(drawer.event, animals)}
            onDelete={() => {openDelete(drawer.event!); closeDrawer();}}
        />
    );
}