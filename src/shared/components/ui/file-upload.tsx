'use client'

import * as React from 'react'
import { FileText, RotateCcw, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from './button'
import { Progress } from './progress'

type FileUploadStatus = 'idle' | 'uploading' | 'success' | 'error'

type FileUploadProps = {
  accept?: string
  className?: string
  disabled?: boolean
  file?: File | null
  label?: string
  maxSize?: number
  onFileChange: (file: File | null) => void
  onRetry?: () => void
  progress?: number
  status?: FileUploadStatus
}

function formatFileSize(size: number) {
  return size < 1024 * 1024 ? `${Math.ceil(size / 1024)} Ko` : `${(size / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`
}

function FileUpload({ accept, className, disabled = false, file = null, label = 'Ajouter un fichier', maxSize, onFileChange, onRetry, progress, status = 'idle' }: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = React.useState(false)
  const [validationError, setValidationError] = React.useState<string | null>(null)
  const error = status === 'error' ? 'L’envoi du fichier a échoué. Réessayez.' : validationError

  function selectFile(candidate: File | undefined) {
    if (!candidate) return
    if (maxSize && candidate.size > maxSize) {
      setValidationError(`Ce fichier dépasse la limite de ${formatFileSize(maxSize)}.`)
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    setValidationError(null)
    onFileChange(candidate)
  }

  function removeFile() {
    setValidationError(null)
    if (inputRef.current) inputRef.current.value = ''
    onFileChange(null)
  }

  return (
    <section
      data-slot="file-upload"
      className={cn(
        'grid min-h-36 gap-3 rounded-overlay border border-dashed bg-card p-4 transition-[background-color,border-color] duration-[var(--motion-fast)]',
        dragActive && 'border-2 border-ring bg-info/10',
        status === 'error' && 'border-2 border-destructive bg-destructive/10',
        status === 'success' && 'border-success bg-success/10',
        disabled && 'border-solid bg-muted text-muted-foreground',
        className,
      )}
      aria-label="Gestionnaire de fichier"
      onDragEnter={(event) => { event.preventDefault(); if (!disabled) setDragActive(true) }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragActive(false) }}
      onDrop={(event) => { event.preventDefault(); setDragActive(false); if (!disabled) selectFile(event.dataTransfer.files[0]) }}
    >
      <input ref={inputRef} className="sr-only" type="file" accept={accept} disabled={disabled} onChange={(event) => selectFile(event.target.files?.[0])} />
      {!file && <><div className="flex items-center gap-3"><FileText aria-hidden="true" className="size-6 text-primary" /><div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-muted-foreground">{dragActive ? 'Relâcher pour importer' : 'Déposez un fichier ou parcourez vos documents'}</p></div></div><Button type="button" size="sm" className="w-fit" disabled={disabled} onClick={() => inputRef.current?.click()}>Parcourir</Button></>}
      {file && <div className="flex min-w-0 items-center gap-3"><FileText aria-hidden="true" className="size-5 shrink-0 text-primary" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{file.name}</p><p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p></div>{status !== 'uploading' && <Button type="button" size="icon" variant="ghost" aria-label={`Retirer ${file.name}`} disabled={disabled} onClick={removeFile}><X aria-hidden="true" /></Button>}</div>}
      {status === 'uploading' && <div className="grid gap-2" aria-live="polite"><Progress value={progress} aria-label="Progression de l’envoi" /><p className="text-xs text-muted-foreground">Envoi en cours{typeof progress === 'number' ? ` · ${progress} %` : '…'}</p></div>}
      {status === 'success' && file && <p role="status" className="text-sm font-medium text-success">Fichier ajouté.</p>}
      {error && <div role="alert" className="flex flex-wrap items-center gap-2 text-sm font-medium text-destructive"><span>{error}</span>{status === 'error' && onRetry && <Button type="button" size="sm" variant="outline" onClick={onRetry}><RotateCcw aria-hidden="true" />Réessayer</Button>}</div>}
    </section>
  )
}

export { FileUpload, formatFileSize, type FileUploadProps, type FileUploadStatus }
