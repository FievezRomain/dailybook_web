import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAnimalForm } from './use-animal-form';

function submitEvent() {
  return { preventDefault: vi.fn() } as unknown as React.FormEvent;
}

describe('useAnimalForm', () => {
  it('valide les champs obligatoires sans provider applicatif', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useAnimalForm());

    act(() => result.current.handleSubmit(onSubmit)(submitEvent()));

    expect(result.current.errors).toEqual({
      nom: 'Le nom est requis',
      espece: "L'espèce est requise",
      datenaissance: 'La date de naissance est requise',
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('soumet un brouillon valide', () => {
    const animal = { nom: 'Moka', espece: 'Chat', datenaissance: '2020-02-02' };
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useAnimalForm(animal));

    act(() => result.current.handleSubmit(onSubmit)(submitEvent()));

    expect(onSubmit).toHaveBeenCalledWith(animal);
    expect(result.current.errors).toEqual({});
  });
});
