import { act, renderHook } from '@testing-library/react';
import type { FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useEventForm } from './use-event-form';

function submitEvent() {
  return { preventDefault: vi.fn() } as unknown as FormEvent;
}

describe('useEventForm', () => {
  it('valide les champs obligatoires sans provider applicatif', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useEventForm());

    act(() => result.current.handleSubmit(onSubmit)(submitEvent()));

    expect(result.current.errors).toEqual({
      nom: 'Le nom est requis',
      eventtype: 'Le type est requis',
      dateevent: 'La date est requise',
      animaux: 'Sélectionnez au moins un animal',
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('exige une catégorie pour une dépense', () => {
    const onSubmit = vi.fn();
    const event = {
      nom: 'Croquettes',
      eventtype: 'depense',
      dateevent: '2026-08-24',
      animaux: [7],
    };
    const { result } = renderHook(() => useEventForm(event));

    act(() => result.current.handleSubmit(onSubmit)(submitEvent()));

    expect(result.current.errors).toEqual({
      categoriedepense: 'La catégorie de dépense est requise',
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('soumet un événement valide', () => {
    const onSubmit = vi.fn();
    const event = {
      nom: 'Vaccin',
      eventtype: 'soins',
      dateevent: '2026-08-24',
      animaux: [7],
    };
    const { result } = renderHook(() => useEventForm(event));

    act(() => result.current.handleSubmit(onSubmit)(submitEvent()));

    expect(onSubmit).toHaveBeenCalledWith(event);
    expect(result.current.errors).toEqual({});
  });

  it('exige une date de fin cohérente pour une récurrence compatible', () => {
    const onSubmit = vi.fn();
    const event = {
      nom: 'Traitement', eventtype: 'soins', dateevent: '2026-08-24', datefinsoins: '2026-08-20',
      animaux: [7], frequencevalue: 'daily',
    };
    const { result } = renderHook(() => useEventForm(event));

    act(() => result.current.handleSubmit(onSubmit)(submitEvent()));

    expect(result.current.errors.frequencevalue).toBe('La date de fin doit suivre la date de début');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
