import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ContactsContent from './ContactsContent';

const mocks = vi.hoisted(() => ({ query: vi.fn(), create: vi.fn(), remove: vi.fn() }));
vi.mock('../hooks/use-contacts', () => ({ useContactsQuery: mocks.query }));

describe('ContactsContent', () => {
  beforeEach(() => {
    mocks.create.mockReset().mockResolvedValue({ id: 2 });
    mocks.remove.mockReset().mockResolvedValue(undefined);
    mocks.query.mockReturnValue({ contacts: [], isLoading: false, isError: false, isMutating: false, createContact: mocks.create, updateContact: vi.fn(), deleteContact: mocks.remove, refetch: vi.fn() });
  });

  it('crée un contact avec les champs canoniques', async () => {
    render(<ContactsContent startCreating />);
    fireEvent.change(screen.getByLabelText(/Nom/), { target: { value: 'Clinique Vasco' } });
    fireEvent.change(screen.getByLabelText('Profession'), { target: { value: 'Vétérinaire' } });
    fireEvent.change(screen.getByLabelText('Téléphone'), { target: { value: '0102030405' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'contact@vasco.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer le contact' }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalledWith({ nom: 'Clinique Vasco', profession: 'Vétérinaire', telephone: '0102030405', email_contact: 'contact@vasco.test' }));
  });

  it('expose les coordonnées dans le détail', () => {
    mocks.query.mockReturnValue({ contacts: [{ id: 7, nom: 'Maréchal', profession: 'Maréchal-ferrant', telephone: '0600000000', email: 'marechal@vasco.test' }], isLoading: false, isError: false, isMutating: false, createContact: mocks.create, updateContact: vi.fn(), deleteContact: mocks.remove, refetch: vi.fn() });
    render(<ContactsContent />);
    fireEvent.click(screen.getByText('Maréchal'));
    expect(screen.getByRole('link', { name: /0600000000/ })).toHaveAttribute('href', 'tel:0600000000');
    expect(screen.getByRole('link', { name: /marechal@vasco.test/ })).toHaveAttribute('href', 'mailto:marechal@vasco.test');
  });
});
