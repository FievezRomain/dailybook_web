import { act, renderHook } from '@testing-library/react';
import type { FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useObjectiveForm } from './use-objective-form';

function submitEvent() {
  return { preventDefault: vi.fn() } as unknown as FormEvent;
}

describe('useObjectiveForm', () => {
  it('valide les champs et sous-étapes obligatoires sans provider applicatif', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useObjectiveForm());

    act(() => result.current.handleSubmit(onSubmit)(submitEvent()));

    expect(result.current.errors).toEqual({
      title: 'Le titre est requis',
      datedebut: 'La date de début est requise',
      datefin: 'La date de fin est requise',
      sousetapes: 'Ajoutez au moins une étape',
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('refuse une période inversée', () => {
    const onSubmit = vi.fn();
    const objective = {
      title: 'Préparation concours',
      datedebut: '2026-09-10',
      datefin: '2026-09-01',
      sousetapes: [{ etape: 'Reprendre le travail', state: false, order: 1 }],
    };
    const { result } = renderHook(() => useObjectiveForm(objective));

    act(() => result.current.handleSubmit(onSubmit)(submitEvent()));

    expect(result.current.errors.datefin).toBe('La date de fin doit suivre la date de début');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('ajoute, modifie puis retire une sous-étape localement', () => {
    const { result } = renderHook(() => useObjectiveForm());

    act(() => result.current.handleAddEtape());
    expect(result.current.values.sousetapes).toEqual([
      { id: undefined, etape: '', state: false, order: 1 },
    ]);

    act(() => result.current.handleEtapeChange(0, 'Marcher vingt minutes'));
    expect(result.current.values.sousetapes?.[0].etape).toBe('Marcher vingt minutes');

    act(() => result.current.handleRemoveEtape(0));
    expect(result.current.values.sousetapes).toEqual([]);
  });

  it('soumet un objectif valide', () => {
    const onSubmit = vi.fn();
    const objective = {
      title: 'Préparation concours',
      datedebut: '2026-09-01',
      datefin: '2026-09-10',
      sousetapes: [{ etape: 'Reprendre le travail', state: false, order: 1 }],
    };
    const { result } = renderHook(() => useObjectiveForm(objective));

    act(() => result.current.handleSubmit(onSubmit)(submitEvent()));

    expect(onSubmit).toHaveBeenCalledWith(objective);
    expect(result.current.errors).toEqual({});
  });
});
