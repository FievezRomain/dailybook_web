import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CalendarContent from "./CalendarContent";

const mocks = vi.hoisted(() => ({
  events: [] as Array<Record<string, unknown>>,
  openDetail: vi.fn(),
  refetch: vi.fn(),
  query: {
    isLoading: false,
    isError: false,
    isRefetchError: false,
    error: null as Error | null,
  },
}));

vi.mock("@/features/events/hooks/use-events", () => ({
  useEventsQuery: () => ({
    events: mocks.events,
    refetch: mocks.refetch,
    patchEvent: vi.fn(),
    ...mocks.query,
  }),
  useEventHighlights: () => ({ data: [] }),
}));
vi.mock("@/features/events/context/event-drawer-context", () => ({
  useEventDrawer: () => ({ openDrawer: mocks.openDetail }),
}));
vi.mock("@/features/events/context/event-form-drawer-context", () => ({
  useEventFormDrawer: () => ({ openDrawer: vi.fn() }),
}));
vi.mock("@/features/events/context/event-delete-context", () => ({
  useEventDelete: () => ({ openDelete: vi.fn() }),
}));
vi.mock("@/features/animals/hooks/use-animals", () => ({
  useAnimalsQuery: () => ({
    animals: [
      { id: 2, nom: "Aria" },
      { id: 3, nom: "Nox" },
    ],
    isLoading: false,
    isError: false,
  }),
}));

const event = {
  id: 8,
  nom: "Vaccin annuel",
  dateevent: format(new Date(), "yyyy-MM-dd"),
  animaux: [2],
  eventtype: "rdv",
  state: "À faire",
  heuredebutevent: "14:00",
  documents: [],
  shared_groups: [],
  todisplay: true,
};

describe("CalendarContent", () => {
  beforeEach(() => {
    mocks.events = [event];
    mocks.openDetail.mockReset();
    mocks.refetch.mockReset();
    mocks.query = {
      isLoading: false,
      isError: false,
      isRefetchError: false,
      error: null,
    };
  });

  it("affiche le titre, le type et le détail d’un événement sans dépendre de la couleur", async () => {
    const user = userEvent.setup();
    render(<CalendarContent />);
    const monthLabel = format(new Date(), "MMMM yyyy", { locale: fr });
    const selectedDateLabel = format(new Date(), "EEEE d MMMM", { locale: fr });
    expect(screen.getByRole("heading", { name: monthLabel.charAt(0).toLocaleUpperCase("fr-FR") + monthLabel.slice(1) })).toBeVisible();
    expect(screen.getByRole("heading", { name: selectedDateLabel.charAt(0).toLocaleUpperCase("fr-FR") + selectedDateLabel.slice(1) })).toBeVisible();
    expect(screen.getAllByText("Vaccin annuel").length).toBeGreaterThan(0);
    expect(
      screen.getByLabelText("Carte d’événement Vaccin annuel"),
    ).toBeVisible();
    const titles = screen.getAllByText("Vaccin annuel");
    await user.click(titles[titles.length - 1]);
    expect(mocks.openDetail).toHaveBeenCalledWith(
      expect.objectContaining({ id: 8, titleType: "Rendez-vous médical" }),
    );
  });

  it("filtre les événements sans dupliquer les actions de création globales", async () => {
    const user = userEvent.setup();
    render(<CalendarContent />);
    expect(
      screen.queryByRole("searchbox", { name: "Rechercher un événement" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Filtres" }));
    await user.type(
      screen.getByRole("searchbox", { name: "Rechercher un événement" }),
      "balade",
    );
    expect(screen.queryByText("Vaccin annuel")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Ajouter|Nouvel événement/ }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Afficher 0 événements" }));
    expect(screen.getByRole("heading", { name: "Recherche" })).toBeVisible();
    expect(screen.getByText("Aucun événement trouvé")).toBeVisible();
  });

  it("affiche tous les événements filtrés dans le panneau Recherche", async () => {
    const user = userEvent.setup();
    mocks.events = [
      event,
      {
        ...event,
        id: 9,
        nom: "Vaccin de rappel",
        dateevent: format(addDays(new Date(), 2), "yyyy-MM-dd"),
      },
    ];
    render(<CalendarContent />);

    await user.click(screen.getByRole("button", { name: "Filtres" }));
    const search = screen.getByRole("searchbox", { name: "Rechercher un événement" });
    await user.type(search, "vaccin");
    expect(screen.getByRole("button", { name: "Effacer la recherche" })).toHaveClass("text-primary");
    await user.click(screen.getByRole("button", { name: "Afficher 2 événements" }));

    const panel = screen.getByRole("complementary");
    expect(within(panel).getByRole("heading", { name: "Recherche" })).toBeVisible();
    expect(within(panel).getByLabelText("Carte d’événement Vaccin annuel")).toBeVisible();
    expect(within(panel).getByLabelText("Carte d’événement Vaccin de rappel")).toBeVisible();
  });

  it("reprend l’icône mobile et réinitialise tous les filtres depuis la croix", async () => {
    const user = userEvent.setup();
    render(<CalendarContent />);

    const filterButton = screen.getByRole("button", { name: "Filtres" });
    expect(filterButton.querySelector('[data-icon-name="filter"]')).toHaveAttribute('data-icon-provider', 'material-community');
    await user.click(filterButton);
    await user.type(
      screen.getByRole("searchbox", { name: "Rechercher un événement" }),
      "vaccin",
    );
    await user.click(screen.getByRole("button", { name: "Afficher 1 événement" }));

    expect(screen.getByRole("button", { name: "Filtres (1)" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Réinitialiser les filtres" }));

    expect(screen.getByRole("button", { name: "Filtres" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Réinitialiser les filtres" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Recherche" })).not.toBeInTheDocument();
  });

  it("sélectionne toute la cellule au clic, avec Entrée ou Espace, et actualise le panneau du jour", async () => {
    const user = userEvent.setup();
    render(<CalendarContent />);
    const tomorrow = addDays(new Date(), 1);
    const tomorrowLabel = format(tomorrow, "EEEE d MMMM", { locale: fr });
    const tomorrowCell = screen.getByRole("gridcell", {
      name: new RegExp(tomorrowLabel, "i"),
    });

    await user.click(tomorrowCell);
    expect(tomorrowCell).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", {
      name: tomorrowLabel.charAt(0).toLocaleUpperCase("fr-FR") + tomorrowLabel.slice(1),
    })).toBeVisible();

    const following = addDays(tomorrow, 1);
    const followingLabel = format(following, "EEEE d MMMM", { locale: fr });
    const followingCell = screen.getByRole("gridcell", {
      name: new RegExp(followingLabel, "i"),
    });
    followingCell.focus();
    await user.keyboard("{Enter}");
    expect(followingCell).toHaveAttribute("aria-selected", "true");

    const thirdDay = addDays(following, 1);
    const thirdDayCell = screen.getByRole("gridcell", {
      name: new RegExp(format(thirdDay, "EEEE d MMMM", { locale: fr }), "i"),
    });
    thirdDayCell.focus();
    await user.keyboard(" ");
    expect(thirdDayCell).toHaveAttribute("aria-selected", "true");
  });

  it("combine recherche, type et filtres animaux avec une remise à zéro explicite", async () => {
    const user = userEvent.setup();
    mocks.events = [
      event,
      {
        ...event,
        id: 9,
        nom: "Balade de Nox",
        eventtype: "balade",
        animaux: [3],
      },
    ];
    render(<CalendarContent />);

    await user.click(screen.getByRole("button", { name: "Filtres" }));
    await user.click(screen.getByRole("button", { name: "Aria" }));
    expect(screen.queryByText("Balade de Nox")).not.toBeInTheDocument();
    await user.type(
      screen.getByRole("searchbox", { name: "Rechercher un événement" }),
      "vaccin",
    );
    await user.click(
      screen.getByRole("combobox", { name: "Type d’événement" }),
    );
    await user.click(screen.getByRole("option", { name: "Rendez-vous médical" }));
    expect(screen.getAllByText("Vaccin annuel").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "Afficher 1 événement" }),
    ).toBeVisible();
    await user.click(
      screen.getByRole("combobox", { name: "Type d’événement" }),
    );
    await user.click(screen.getByRole("option", { name: "Balade" }));
    expect(screen.queryByText("Vaccin annuel")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Afficher 0 événements" }),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Réinitialiser" }));
    expect(screen.getAllByText("Vaccin annuel").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Balade de Nox").length).toBeGreaterThan(0);
  });

  it("conserve les données visibles et signale un échec de rafraîchissement", () => {
    mocks.query.isRefetchError = true;
    render(<CalendarContent />);
    expect(
      screen.getByText("Les données affichées peuvent ne pas être à jour."),
    ).toBeVisible();
  });

  it("propose une relance lorsque le chargement initial échoue", async () => {
    const user = userEvent.setup();
    mocks.events = [];
    mocks.query = {
      isLoading: false,
      isError: true,
      isRefetchError: false,
      error: new Error("Service indisponible"),
    };
    render(<CalendarContent />);

    expect(screen.getByText("Impossible de charger l’agenda")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });
});
