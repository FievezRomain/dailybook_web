import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NotesContent from './NotesContent';

const mocks = vi.hoisted(() => ({ query: vi.fn(), create: vi.fn() }));
vi.mock('../hooks/use-notes', () => ({ useNotesQuery: mocks.query }));

describe('NotesContent', () => {
  beforeEach(() => {
    mocks.create.mockReset().mockResolvedValue({ id: 2 });
    mocks.query.mockReturnValue({ notes: [], isLoading: false, isError: false, isMutating: false, createNote: mocks.create, updateNote: vi.fn(), deleteNote: vi.fn(), refetch: vi.fn() });
  });

  it('affiche l’état vide puis crée une note Markdown', async () => {
    render(<NotesContent />);
    expect(screen.getByText('Aucune note')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Nouvelle note' }));
    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'Préparer le concours' } });
    fireEvent.change(screen.getByLabelText('Contenu'), { target: { value: '- Vérifier le matériel' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer la note' }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalledWith({ titre: 'Préparer le concours', note: '- Vérifier le matériel', is_pinned: false }));
  });
});
