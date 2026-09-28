import { beforeEach, describe, expect, it, vi } from 'vitest';

const client = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock('@/shared/api/web-api-client', () => ({ webApiClient: client }));

import { createObjective, deleteObjective, getObjectives, updateObjective, updateObjectiveSubtaskState } from './objectives-api';

const objective = {
  id: 5, title: 'Reprise sportive', temporalityobjectif: null,
  datedebut: '2026-09-20', datefin: '2026-10-20', animaux: [3],
  sousetapes: [{ id: 9, etape: 'Marcher vingt minutes', state: false, order: 1, objectif_id: 5 }],
};

describe('objectives-api', () => {
  beforeEach(() => vi.clearAllMocks());

  it('valide la liste et les mutations complètes', async () => {
    client.get.mockResolvedValue({ data: [objective] });
    client.post.mockResolvedValue({ data: objective });
    client.put.mockResolvedValue({ data: objective });
    client.patch.mockResolvedValue({ data: { id: 9, state: true } });
    client.delete.mockResolvedValue({});

    await expect(getObjectives()).resolves.toEqual([expect.objectContaining({ id: 5 })]);
    await expect(createObjective({ title: 'Reprise sportive', animaux: [3], sousetapes: [{ etape: 'Marcher vingt minutes' }] })).resolves.toEqual(expect.objectContaining({ id: 5 }));
    await expect(updateObjective(5, { id: 5, title: 'Reprise sportive', animaux: [3], sousetapes: [{ id: 9, etape: 'Marcher vingt minutes' }] })).resolves.toEqual(expect.objectContaining({ id: 5 }));
    await expect(updateObjectiveSubtaskState(5, 9, { state: true })).resolves.toEqual({ id: 9, state: true });
    await expect(deleteObjective(5)).resolves.toBeUndefined();

    expect(client.patch).toHaveBeenCalledWith('/objectifs/5/subtasks/9', { state: true });
    expect(client.delete).toHaveBeenCalledWith('/objectifs/5');
  });
});
