import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteOrphanEventFile, uploadEventFile } from './event-files'

const mocks = vi.hoisted(() => ({
  del: vi.fn(),
  post: vi.fn(),
  validate: vi.fn((value: string) => value),
  prepare: vi.fn(),
}))

vi.mock('@/shared/api/web-api-client', () => ({ webApiClient: { delete: mocks.del, post: mocks.post } }))
vi.mock('@/shared/security/presigned-url', () => ({ validatePresignedUrl: mocks.validate }))
vi.mock('@/shared/utils/prepare-image-upload', () => ({
  prepareImageUpload: mocks.prepare,
  isSupportedImageUpload: (file: File) => file.type.startsWith('image/') && file.type !== 'image/svg+xml',
}))

const filename = 'a'.repeat(32) + '.pdf'

describe('documents d’événement', () => {
  beforeEach(() => {
    mocks.del.mockReset(); mocks.post.mockReset(); mocks.validate.mockClear(); mocks.prepare.mockReset()
    mocks.prepare.mockImplementation(async (file: File) => new File([file], 'prepared.jpg', { type: 'image/jpeg' }))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
  })

  it('refuse un type non autorisé avant tout appel BFF', async () => {
    const file = new File(['<svg/>'], 'document.svg', { type: 'image/svg+xml' })
    await expect(uploadEventFile(file, 7)).rejects.toThrow('image compatible')
    expect(mocks.post).not.toHaveBeenCalled()
  })

  it('demande un ticket, envoie le fichier puis confirme sa finalisation', async () => {
    const file = new File(['contenu'], 'ordonnance.pdf', { type: 'application/pdf' })
    mocks.post.mockResolvedValueOnce({ data: { url: 'https://storage.example.test/upload', fields: { key: filename }, filename } }).mockResolvedValueOnce({ data: {} })

    await expect(uploadEventFile(file, 12)).resolves.toBe(filename)
    expect(mocks.post).toHaveBeenNthCalledWith(1, '/files/upload-url', expect.objectContaining({ resourceType: 'event', resourceId: 12, contentType: 'application/pdf' }))
    expect(fetch).toHaveBeenCalledWith('https://storage.example.test/upload', expect.objectContaining({ method: 'POST' }))
    expect(mocks.post).toHaveBeenNthCalledWith(2, '/files/upload-complete', { filename, contentType: 'application/pdf', resourceType: 'event', resourceId: 12 })
  })

  it('compresse une photo avant de demander le ticket S3', async () => {
    const imageFilename = 'b'.repeat(32) + '.jpg'
    const file = new File(['contenu'], 'iphone.heic', { type: 'image/heic' })
    mocks.post.mockResolvedValueOnce({ data: { url: 'https://storage.example.test/upload', fields: {}, filename: imageFilename } }).mockResolvedValueOnce({ data: {} })

    await expect(uploadEventFile(file, 12)).resolves.toBe(imageFilename)

    expect(mocks.prepare).toHaveBeenCalledWith(file, 'event')
    expect(mocks.post).toHaveBeenNthCalledWith(1, '/files/upload-url', expect.objectContaining({
      contentType: 'image/jpeg',
      sizeBytes: expect.any(Number),
    }))
    expect(mocks.post).toHaveBeenNthCalledWith(2, '/files/upload-complete', expect.objectContaining({
      contentType: 'image/jpeg',
    }))
  })

  it('supprime un upload orphelin avec la portée événement', async () => {
    await deleteOrphanEventFile(filename, 12)
    expect(mocks.del).toHaveBeenCalledWith(`/files/${filename}?resourceType=event&resourceId=12`)
  })
})
