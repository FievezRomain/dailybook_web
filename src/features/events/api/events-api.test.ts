import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  validatePresignedUrl: vi.fn((value: unknown) => String(value)),
}));

vi.mock("@/shared/api/web-api-client", () => ({
  webApiClient: { get: mocks.get, post: mocks.post, put: mocks.put, patch: mocks.patch, delete: mocks.delete },
}));
vi.mock("@/shared/security/presigned-url", () => ({
  validatePresignedUrl: mocks.validatePresignedUrl,
}));

import {
  attachEventDocument, createEvent, deleteEvent, deleteEventDocument, getEventDocumentUrl,
  getEventHighlights, getEvents, patchEvent, updateEvent,
} from "./events-api";

const event = { id: 8, nom: 'Vaccin', dateevent: '2026-09-20', animaux: [3], eventtype: 'soins', state: 'À faire', documents: [], shared_groups: [], todisplay: true };

describe("getEventDocumentUrl", () => {
  beforeEach(() => vi.clearAllMocks());

  it("utilise le flux de fichiers authentifié avec le contexte de l’événement", async () => {
    mocks.get.mockResolvedValue({
      data: { url: "https://storage.example/document.pdf?signature=test" },
    });

    await expect(getEventDocumentUrl(42, "ordonnance cheval.pdf")).resolves.toBe(
      "https://storage.example/document.pdf?signature=test",
    );

    expect(mocks.get).toHaveBeenCalledWith(
      "/files/ordonnance%20cheval.pdf?resourceType=event&resourceId=42",
    );
    expect(mocks.validatePresignedUrl).toHaveBeenCalledOnce();
  });

  it('valide les lectures et toutes les mutations événement', async () => {
    mocks.get.mockResolvedValueOnce({ data: [event] }).mockResolvedValueOnce({
      data: [{
        id: 'animal-birthday-3-2026',
        date: '2026-09-20',
        kind: 'animal_birthday',
        title: 'Anniversaire de Vasco',
        animal_ids: [3],
      }],
    });
    mocks.post.mockResolvedValue({ data: [event] });
    mocks.put.mockResolvedValue({ data: [event] });
    mocks.patch.mockResolvedValue({ data: [event] });
    mocks.delete.mockResolvedValue({ data: [event] });

    await expect(getEvents()).resolves.toEqual([event]);
    await expect(getEventHighlights(2026)).resolves.toHaveLength(1);
    await expect(createEvent(event as never)).resolves.toEqual([event]);
    await expect(updateEvent(8, event as never)).resolves.toEqual([event]);
    await expect(patchEvent(8, { state: 'TerminÃ©' })).resolves.toEqual([event]);
    await expect(deleteEvent(8, 'series')).resolves.toEqual([event]);

    expect(mocks.get).toHaveBeenNthCalledWith(2, '/events/highlights?year=2026');
    expect(mocks.delete).toHaveBeenCalledWith('/events/8?scope=series');
  });

  it('attache et retire un document en encodant son nom', async () => {
    mocks.post.mockResolvedValue({});
    mocks.delete.mockResolvedValue({});
    await attachEventDocument(8, 'bilan été.pdf');
    await deleteEventDocument(8, 'bilan été.pdf');
    expect(mocks.post).toHaveBeenCalledWith('/events/8/documents/bilan%20%C3%A9t%C3%A9.pdf');
    expect(mocks.delete).toHaveBeenCalledWith('/events/8/documents/bilan%20%C3%A9t%C3%A9.pdf');
  });
});
