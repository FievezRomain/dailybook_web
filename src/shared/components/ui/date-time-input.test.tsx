import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DateInput, TimeInput } from "./form-feedback";

describe("DateInput et TimeInput", () => {
  it("sélectionne une date dans le calendrier et le ferme", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(
      <DateInput
        aria-label="Date"
        defaultValue="2026-09-15"
        onChange={onChange}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByLabelText("Date"));
    const calendarDialog = screen.getByRole("dialog", {
      name: "Choisir une date",
    });
    expect(calendarDialog).toBeInTheDocument();
    expect(calendarDialog.querySelector('[data-slot="calendar"]')).toHaveStyle({
      "--cell-size": "1.5rem",
    });
    expect(screen.getByText(/septembre 2026/i)).toBeInTheDocument();
    expect(calendarDialog.querySelector(".rdp-weekday")).toHaveTextContent(/lu/i);
    expect(screen.getByRole("button", { name: "Mois précédent" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mois suivant" })).toBeInTheDocument();
    expect(calendarDialog).toHaveClass(
      "max-h-[calc(100vh-2rem)]",
      "max-w-[calc(100vw-2rem)]",
      "overflow-y-auto",
    );
    const day = document.querySelector<HTMLButtonElement>(
      'button[data-day]:not([data-selected-single="true"])',
    );
    expect(day).not.toBeNull();
    expect(day).toHaveClass("text-[11px]");
    fireEvent.click(day!);
    expect(onValueChange).toHaveBeenCalledWith(
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    );
    expect(onChange).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole("dialog", { name: "Choisir une date" }),
    ).not.toBeInTheDocument();
  });

  it("conserve la valeur en passant du sélecteur à la saisie manuelle", () => {
    const onValueChange = vi.fn();
    render(
      <TimeInput
        aria-label="Horaire"
        defaultValue="14:30"
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByLabelText("Horaire"));
    fireEvent.click(screen.getByRole("button", { name: "Saisie" }));
    expect(screen.getByLabelText("Heure")).toHaveValue(14);
    expect(screen.getByLabelText("Minute")).toHaveValue(30);
    fireEvent.change(screen.getByLabelText("Heure"), {
      target: { value: "16" },
    });
    expect(onValueChange).toHaveBeenLastCalledWith("16:30");
  });

  it("propose le raccourci Maintenant et ferme avec Échap", () => {
    const onValueChange = vi.fn();
    render(<TimeInput aria-label="Horaire" onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Choisir une heure" }));
    fireEvent.click(screen.getByRole("button", { name: "Maintenant" }));
    expect(onValueChange).toHaveBeenCalledWith(
      expect.stringMatching(/^\d{2}:\d{2}$/),
    );
    fireEvent.keyDown(
      screen.getByRole("dialog", { name: "Choisir une heure" }),
      { key: "Escape" },
    );
    expect(
      screen.queryByRole("dialog", { name: "Choisir une heure" }),
    ).not.toBeInTheDocument();
  });
});
