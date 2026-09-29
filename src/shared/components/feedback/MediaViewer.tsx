'use client'

/* Signed preview URLs are short-lived and deliberately bypass Next image optimization. */
/* eslint-disable @next/next/no-img-element */

import { Download, FileText, ImageIcon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { openPresignedUrl } from '@/shared/security/presigned-url'

type MediaViewerProps = {
  fileName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string | null
}

function isImage(fileName: string) {
  return /\.(?:jpe?g|png|webp)$/i.test(fileName)
}

export function MediaViewer({ fileName, onOpenChange, open, url }: MediaViewerProps) {
  const image = isImage(fileName)
  const displayName = fileName.split('/').pop() ?? fileName

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="flex max-h-[90dvh] max-w-5xl flex-col gap-surface overflow-hidden p-0" closeLabel="Fermer l’aperçu">
      <DialogHeader className="border-b px-surface py-control pr-16"><DialogTitle className="flex items-center gap-control"><span className="flex size-9 items-center justify-center rounded-full bg-muted text-primary">{image ? <ImageIcon className="size-5" aria-hidden="true" /> : <FileText className="size-5" aria-hidden="true" />}</span>{displayName}</DialogTitle><DialogDescription>{image ? 'Aperçu sécurisé de l’image.' : 'Aperçu sécurisé du document PDF.'}</DialogDescription></DialogHeader>
      {url ? <div className="min-h-0 flex-1 overflow-auto bg-muted/30 p-surface">{image ? <img src={url} alt={`Aperçu de ${displayName}`} className="mx-auto max-h-[65dvh] max-w-full rounded-surface object-contain shadow-surface" /> : <iframe src={url} title={`Aperçu de ${displayName}`} className="h-[65dvh] w-full rounded-surface border bg-background" />}</div> : <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground" role="status">Chargement de l’aperçu…</div>}
      <div className="flex justify-end border-t px-surface py-control"><Button type="button" variant="outline" disabled={!url} onClick={() => url && openPresignedUrl(url)}><Download className="size-4" aria-hidden="true" /> Télécharger</Button></div>
    </DialogContent>
  </Dialog>
}
