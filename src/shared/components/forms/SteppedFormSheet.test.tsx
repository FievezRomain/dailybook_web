import { fireEvent, render, screen } from "@testing-library/react";
import { CalendarDays } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { SteppedFormSheet } from "./SteppedFormSheet";

describe("SteppedFormSheet", () => {
  it("ne soumet le formulaire qu’après un clic explicite sur le bouton final", () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) =>
      event.preventDefault(),
    );

    render(
      <SteppedFormSheet
        open
        onClose={vi.fn()}
        onSubmit={onSubmit}
        title="Ajouter un animal"
        description="Renseignez sa fiche"
        submitLabel="Ajouter l’animal"
        steps={[
          {
            title: "Compléments",
            description: "Dernières informations facultatives.",
            icon: CalendarDays,
            content: <p>Dernière étape</p>,
          },
        ]}
      />,
    );

    expect(document.querySelector('[data-slot="dialog-header"]')).toHaveClass('bg-background');

    fireEvent.submit(screen.getByRole("form"));
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Ajouter l’animal" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

});
