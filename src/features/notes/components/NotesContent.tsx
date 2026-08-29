'use client';

import { useMemo, useState } from 'react';
import { MoreHorizontal, Pin, Plus, Search, StickyNote } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog';
import { PageHeader, PageShell, PageTitle } from '@/shared/components/layout/PageShell';
import { useNotesQuery } from '../hooks/use-notes';
import type { Note } from '../types/note';

function NoteForm({ note, busy, onClose, onSave }: {
  note: Note | null;
  busy: boolean;
  onClose: () => void;
  onSave: (values: { titre: string; note: string; is_pinned: boolean }) => Promise<void>;
}) {
  const [title, setTitle] = useState(note?.titre ?? '');
  const [content, setContent] = useState(note?.note ?? '');
  const [pinned, setPinned] = useState(note?.is_pinned ?? false);
  const dirty = title !== (note?.titre ?? '') || content !== (note?.note ?? '') || pinned !== (note?.is_pinned ?? false);
  const [confirmClose, setConfirmClose] = useState(false);

  function requestClose() {
    if (dirty) setConfirmClose(true);
    else onClose();
  }

  return <>
    <Dialog open onOpenChange={(open) => { if (!open) requestClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{note ? 'Modifier la note' : 'Nouvelle note'}</DialogTitle>
          <DialogDescription>Le contenu est enregistré en Markdown et reste affiché comme du texte sûr.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <label className="grid gap-2"><span className="text-sm font-medium">Titre</span><Input autoFocus value={title} maxLength={255} onChange={(event) => setTitle(event.target.value)} /></label>
          <label className="grid gap-2"><span className="text-sm font-medium">Contenu</span><Textarea className="min-h-64" value={content} maxLength={50_000} onChange={(event) => setContent(event.target.value)} placeholder="Écrivez votre note…" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pinned} onChange={(event) => setPinned(event.target.checked)} /> Épingler cette note</label>
        </div>
        <DialogFooter><Button variant="ghost" onClick={requestClose}>Annuler</Button><Button disabled={!title.trim() || busy} onClick={() => void onSave({ titre: title.trim(), note: content, is_pinned: pinned })}>{note ? 'Enregistrer' : 'Créer la note'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
    <ConfirmDialog open={confirmClose} title="Abandonner les modifications ?" description="Les valeurs saisies dans cette note seront perdues." confirmLabel="Abandonner" onCancel={() => setConfirmClose(false)} onConfirm={onClose} />
  </>;
}

export default function NotesContent({ startCreating = false }: { startCreating?: boolean }) {
  const query = useNotesQuery();
  const [search, setSearch] = useState('');
  const [formNote, setFormNote] = useState<Note | null | undefined>(startCreating ? null : undefined);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const notes = useMemo(() => (query.notes ?? [])
    .filter((note) => `${note.titre} ${note.note}`.toLocaleLowerCase('fr').includes(search.trim().toLocaleLowerCase('fr')))
    .sort((left, right) => Number(right.is_pinned) - Number(left.is_pinned) || (right.updated_at ?? right.created_at ?? '').localeCompare(left.updated_at ?? left.created_at ?? '')),
  [query.notes, search]);

  async function save(values: { titre: string; note: string; is_pinned: boolean }) {
    try {
      if (formNote) await query.updateNote(formNote.id, values);
      else await query.createNote(values);
      setFormNote(undefined);
      toast.success(formNote ? 'Note mise à jour.' : 'Note créée.');
    } catch { toast.error("La note n'a pas pu être enregistrée."); }
  }

  async function togglePin(note: Note) {
    try { await query.updateNote(note.id, { titre: note.titre, note: note.note, is_pinned: !note.is_pinned }); }
    catch { toast.error("L'épinglage n'a pas pu être modifié."); }
  }

  async function remove() {
    if (!noteToDelete) return;
    try { await query.deleteNote(noteToDelete.id); toast.success('Note supprimée.'); }
    catch { toast.error("La note n'a pas pu être supprimée."); }
    finally { setNoteToDelete(null); }
  }

  return (
    <PageShell className="pb-24">
      <PageHeader className="items-center"><div><PageTitle>Notes</PageTitle><p className="text-muted-foreground">Capturez vos informations utiles et retrouvez-les rapidement.</p></div><Button onClick={() => setFormNote(null)}><Plus className="size-4" /> Nouvelle note</Button></PageHeader>
      <label className="relative block max-w-xl"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Rechercher dans les notes</span><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher dans les notes" /></label>

      {query.isLoading && <div aria-live="polite" className="grid gap-4 md:grid-cols-2"><Card><CardContent className="py-12 text-muted-foreground">Chargement des notes…</CardContent></Card></div>}
      {query.isError && <div role="alert" className="rounded-overlay border border-destructive/40 p-surface"><p>Les notes sont indisponibles.</p><Button className="mt-3" variant="outline" onClick={() => void query.refetch()}>Réessayer</Button></div>}
      {!query.isLoading && !query.isError && !notes.length && <Card><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><StickyNote className="size-10 text-muted-foreground" /><div><p className="font-medium">{search ? 'Aucune note correspondante' : 'Aucune note'}</p><p className="text-sm text-muted-foreground">{search ? 'Essayez une autre recherche.' : 'Créez votre première note pour commencer.'}</p></div></CardContent></Card>}
      {!!notes.length && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{notes.map((note) => <Card key={note.id} className="min-w-0">
        <CardHeader className="flex-row items-start justify-between gap-3"><CardTitle className="flex min-w-0 items-center gap-2"><span className="truncate">{note.titre}</span>{note.is_pinned && <><Pin className="size-4 shrink-0 text-primary" /><span className="sr-only">Épinglée</span></>}</CardTitle><DropdownMenu><DropdownMenuTrigger asChild><Button size="icon" variant="ghost" aria-label={`Actions pour ${note.titre}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setFormNote(note)}>Modifier</DropdownMenuItem><DropdownMenuItem onClick={() => void togglePin(note)}>{note.is_pinned ? 'Désépingler' : 'Épingler'}</DropdownMenuItem><DropdownMenuItem variant="destructive" onClick={() => setNoteToDelete(note)}>Supprimer</DropdownMenuItem></DropdownMenuContent></DropdownMenu></CardHeader>
        <CardContent><p className="line-clamp-8 whitespace-pre-wrap break-words text-sm text-muted-foreground">{note.note || 'Note vide'}</p><p className="mt-4 text-xs text-muted-foreground">Markdown · {note.updated_at || note.created_at ? new Date(note.updated_at ?? note.created_at ?? '').toLocaleDateString('fr-FR') : 'date inconnue'}</p></CardContent>
      </Card>)}</div>}

      {formNote !== undefined && <NoteForm key={formNote?.id ?? 'new'} note={formNote} busy={query.isMutating} onClose={() => setFormNote(undefined)} onSave={save} />}
      <ConfirmDialog open={noteToDelete !== null} title="Supprimer cette note ?" description={noteToDelete ? `La note « ${noteToDelete.titre} » sera supprimée définitivement.` : undefined} confirmLabel="Supprimer" onCancel={() => setNoteToDelete(null)} onConfirm={() => void remove()} />
    </PageShell>
  );
}
