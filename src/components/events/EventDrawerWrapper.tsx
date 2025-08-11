import { useEventDrawer } from "@/context/EventDrawerContext";
import { EventDrawer } from "./EventDrawer";
import { useUserContext } from "@/context/UserContext";
import useSWR from "swr";
import { getAnimals } from "@/api/animals";
import { filterAndEnrichAnimals } from "@/utils/animalsUtils";
import { useEventDelete } from "@/context/EventDeleteContext";

export function EventDrawerWrapper() {
    const { drawer, closeDrawer } = useEventDrawer();
    const { user } = useUserContext();
    const { data: animals, isLoading: isLoadingAnimals } = useSWR(['animals'], () => getAnimals());

    // Gestion de l'ouverture du dialog pour confirmer la suppression d'un event
    const { openDelete } = useEventDelete();

    if (!drawer.open || !drawer.event) return null;

    return (
        <EventDrawer
        open={drawer.open}
        onClose={closeDrawer}
        event={drawer.event}
        animals={isLoadingAnimals || !user || !animals ? undefined : filterAndEnrichAnimals(drawer.event, animals, user.uid)}
        onDelete={() => {openDelete(drawer.event!); closeDrawer();}}
        />
    );
}