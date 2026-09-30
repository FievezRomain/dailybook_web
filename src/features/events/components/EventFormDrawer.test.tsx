import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EventFormDrawer } from "./EventFormDrawer";

describe("EventFormDrawer", () => {
  it("permet de choisir le type lorsqu’une création démarre depuis une date seule", () => {
    render(
      <EventFormDrawer
        open
        animals={[]}
        groups={[]}
        isPremium
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onUpdateAnimalImage={vi.fn()}
        initialEvent={{ dateevent: "2026-09-05" }}
      />,
    );

    expect(screen.getByRole("button", { name: /Soins/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /Rendez-vous médical/ })).toBeVisible();
    const eventTypeButtons = screen
      .getAllByRole("button")
      .filter((button) => button.hasAttribute("aria-pressed"));
    expect(eventTypeButtons.map((button) => button.textContent)).toEqual([
      "SoinsSélectionner et continuer",
      "Rendez-vous médicalSélectionner et continuer",
      "BaladeSélectionner et continuer",
      "EntraînementSélectionner et continuer",
      "ConcoursSélectionner et continuer",
      "DépenseSélectionner et continuer",
      "AutreSélectionner et continuer",
    ]);
    expect(eventTypeButtons.map((button) => button.querySelector("svg")?.getAttribute("data-icon-name"))).toEqual([
      "medical",
      "stethoscope",
      "compass",
      "tracking",
      "trophy",
      "expense",
      "circleCheck",
    ]);
    expect(eventTypeButtons.every((button) => button.querySelector("svg")?.getAttribute("data-icon-provider") === "material-community")).toBe(true);
    const stepNavigation = screen.getByRole("navigation", {
      name: "Étapes du formulaire",
    });
    expect(stepNavigation).toBeVisible();
    expect(
      stepNavigation.querySelectorAll('[data-slot="form-step-connector"]'),
    ).toHaveLength(3);
    expect(screen.queryByText("Finaliser")).not.toBeInTheDocument();
    expect(
      stepNavigation.querySelector('[data-slot="form-step-connector"]'),
    ).toHaveClass("left-[calc(-50%+8px)]", "right-[calc(50%+16px)]", "z-0");

    fireEvent.click(screen.getByRole("button", { name: /Soins/ }));

    expect(screen.getByRole("heading", { name: "Essentiel" })).toBeVisible();
    expect(screen.getByText("Soins")).toBeVisible();
    expect(screen.getByText("Type d’événement *")).toBeVisible();
    expect(
      document.querySelector('[data-slot="event-type-summary"]'),
    ).toHaveClass("h-10", "rounded-surface");
    expect(
      screen.getByRole("button", { name: /À faire|Terminé/, pressed: true }),
    ).toHaveClass("bg-primary", "text-primary-foreground");
    expect(
      stepNavigation.querySelector('[data-complete="true"]'),
    ).toBeInTheDocument();

  });
  it("bloque la soumission et annonce la création en cours", () => {
    render(
      <EventFormDrawer
        open
        animals={[]}
        groups={[]}
        isPremium
        isSubmitting
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onUpdateAnimalImage={vi.fn()}
        initialEvent={{ dateevent: "2026-09-05" }}
      />,
    );

    expect(screen.getByRole("form")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Continuer" })).toBeDisabled();
  });
});
