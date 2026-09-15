"use client";

import { useMemo, useState } from "react";
import {
  BookOpenText,
  MoreHorizontal,
  Pin,
  Sparkles,
  StickyNote,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { ConfirmDialog } from "@/shared/components/feedback/ConfirmDialog";
import {
  FormSection,
  SingleStepFormCard,
} from "@/shared/components/forms/SteppedFormSheet";
import { PageHeader, PageShell } from "@/shared/components/layout/PageShell";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { SearchField } from "@/shared/components/ui/search-field";
import { Textarea } from "@/shared/components/ui/textarea";
import { useNotesQuery } from "../hooks/use-notes";
import type { Note } from "../types/note";

function formatDate(note: Note) {
  const value = note.updated_at ?? note.created_at;
  return value
    ? new Date(value).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date inconnue";
}

function Markdown({
  children,
  compact = false,
}: {
  children: string;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "line-clamp-7 text-sm leading-6 text-muted-foreground [&_a]:text-primary [&_a]:underline [&_h1]:mb-2 [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_p+p]:mt-2 [&_strong]:font-semibold [&_strong]:text-foreground"
          : "break-words text-[15px] leading-7 text-foreground/85 [&_a]:text-primary [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p+p]:mt-3 [&_strong]:font-semibold [&_strong]:text-foreground"
      }
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {children || "*Cette note est vide.*"}
      </ReactMarkdown>
    </div>
  );
}

function NoteForm({
  note,
  busy,
  onClose,
  onSave,
}: {
  note: Note | null;
  busy: boolean;
  onClose: () => void;
  onSave: (values: {
    titre: string;
    note: string;
    is_pinned: boolean;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState(note?.titre ?? "");
  const [content, setContent] = useState(note?.note ?? "");
  const [pinned, setPinned] = useState(note?.is_pinned ?? false);
  const [confirmClose, setConfirmClose] = useState(false);
  const dirty =
    title !== (note?.titre ?? "") ||
    content !== (note?.note ?? "") ||
    pinned !== (note?.is_pinned ?? false);
  return (
    <>
      <SingleStepFormCard
        icon={StickyNote}
        eyebrow="Notes"
        title={note ? "Modifier la note" : "Créer une note"}
        description="Écrivez librement : titres, listes et emphases seront rendus proprement à la lecture."
        onClose={() => (dirty ? setConfirmClose(true) : onClose())}
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => (dirty ? setConfirmClose(true) : onClose())}
            >
              Annuler
            </Button>
            <Button
              disabled={!title.trim() || busy}
              onClick={() =>
                void onSave({
                  titre: title.trim(),
                  note: content,
                  is_pinned: pinned,
                })
              }
            >
              {note ? "Enregistrer les modifications" : "Créer la note"}
            </Button>
          </>
        }
      >
        <FormSection
          title="Contenu"
          description="Le Markdown est interprété de manière sûre, sans exécuter de HTML utilisateur."
        >
          <div className="space-y-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Titre</span>
              <Input
                autoFocus
                value={title}
                maxLength={255}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Contenu</span>
              <Textarea
                className="min-h-64"
                value={content}
                maxLength={50_000}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Écrivez votre note…"
              />
            </label>
            <label className="flex min-h-11 items-center gap-3 rounded-control border px-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(event) => setPinned(event.target.checked)}
              />
              Épingler cette note
            </label>
          </div>
        </FormSection>
      </SingleStepFormCard>
      <ConfirmDialog
        open={confirmClose}
        title="Abandonner les modifications ?"
        description="Les valeurs saisies dans cette note seront perdues."
        confirmLabel="Abandonner"
        onCancel={() => setConfirmClose(false)}
        onConfirm={onClose}
      />
    </>
  );
}

function NoteDetail({
  note,
  onClose,
  onEdit,
}: {
  note: Note;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <article className="mx-auto max-w-4xl overflow-hidden rounded-[26px] border bg-card shadow-surface">
      <header className="relative border-b bg-muted/20 px-6 py-7 sm:px-9">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-[#ce9871]"
        />
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          {note.is_pinned ? "Note épinglée" : "Carnet"}
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
          {note.titre}
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Dernière mise à jour · {formatDate(note)}
        </p>
      </header>
      <div className="min-h-72 px-6 py-7 sm:px-9">
        <Markdown>{note.note}</Markdown>
      </div>
      <footer className="flex flex-col-reverse gap-2 border-t bg-muted/10 px-6 py-4 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Retour aux notes
        </Button>
        <Button onClick={onEdit}>Modifier</Button>
      </footer>
    </article>
  );
}

function NoteCard({
  note,
  featured,
  onOpen,
  onEdit,
  onPin,
  onDelete,
}: {
  note: Note;
  featured?: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onPin: () => void;
  onDelete: () => void;
}) {
  return (
    <Card
      className={`group relative mb-4 break-inside-avoid overflow-hidden rounded-[22px] p-0 shadow-sm transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-surface motion-reduce:transform-none ${featured ? "border-primary/20 bg-primary/[0.035]" : ""}`}
    >
      <div
        aria-hidden="true"
        className={`h-1 ${featured ? "bg-gradient-to-r from-primary via-[#b07165] to-[#ce9871]" : "bg-muted"}`}
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <button className="min-w-0 flex-1 text-left" onClick={onOpen}>
            <span className="flex items-center gap-2">
              {featured && (
                <Pin
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
              )}
              <span className="line-clamp-2 text-lg font-semibold leading-snug tracking-[-0.02em]">
                {note.titre}
              </span>
            </span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Actions pour ${note.titre}`}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onOpen}>Lire la note</DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>Modifier</DropdownMenuItem>
              <DropdownMenuItem onClick={onPin}>
                {note.is_pinned ? "Désépingler" : "Épingler"}
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <button className="mt-4 block w-full text-left" onClick={onOpen}>
          <Markdown compact>{note.note}</Markdown>
        </button>
        <p className="mt-5 border-t pt-3 text-[11px] font-medium text-muted-foreground">
          {formatDate(note)}
        </p>
      </div>
    </Card>
  );
}

export default function NotesContent({
  startCreating = false,
}: {
  startCreating?: boolean;
}) {
  const query = useNotesQuery();
  const [search, setSearch] = useState("");
  const [formNote, setFormNote] = useState<Note | null | undefined>(
    startCreating ? null : undefined,
  );
  const [detailNote, setDetailNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const notes = useMemo(
    () =>
      (query.notes ?? [])
        .filter((note) =>
          `${note.titre} ${note.note}`
            .toLocaleLowerCase("fr")
            .includes(search.trim().toLocaleLowerCase("fr")),
        )
        .sort(
          (a, b) =>
            Number(b.is_pinned) - Number(a.is_pinned) ||
            (b.updated_at ?? b.created_at ?? "").localeCompare(
              a.updated_at ?? a.created_at ?? "",
            ),
        ),
    [query.notes, search],
  );
  const pinnedCount = (query.notes ?? []).filter(
    (note) => note.is_pinned,
  ).length;

  async function save(values: {
    titre: string;
    note: string;
    is_pinned: boolean;
  }) {
    try {
      if (formNote) await query.updateNote(formNote.id, values);
      else await query.createNote(values);
      setFormNote(undefined);
      toast.success(formNote ? "Note mise à jour." : "Note créée.");
    } catch {
      toast.error("La note n'a pas pu être enregistrée.");
    }
  }
  async function togglePin(note: Note) {
    try {
      await query.updateNote(note.id, {
        titre: note.titre,
        note: note.note,
        is_pinned: !note.is_pinned,
      });
    } catch {
      toast.error("L'épinglage n'a pas pu être modifié.");
    }
  }
  async function remove() {
    if (!noteToDelete) return;
    try {
      await query.deleteNote(noteToDelete.id);
      toast.success("Note supprimée.");
    } catch {
      toast.error("La note n'a pas pu être supprimée.");
    } finally {
      setNoteToDelete(null);
    }
  }

  return (
    <PageShell className="space-y-6 pb-24">
      <PageHeader className="items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Bibliothèque personnelle
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">
            Vos idées, clairement organisées
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Retrouvez vos informations importantes sans voir les marqueurs de
            mise en forme.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold">
          <BookOpenText className="size-4 text-primary" />
          {query.notes?.length ?? 0} note
          {(query.notes?.length ?? 0) > 1 ? "s" : ""} · {pinnedCount} épinglée
          {pinnedCount > 1 ? "s" : ""}
        </span>
      </PageHeader>
      {detailNote && formNote === undefined ? (
        <NoteDetail
          note={detailNote}
          onClose={() => setDetailNote(null)}
          onEdit={() => {
            setDetailNote(null);
            setFormNote(detailNote);
          }}
        />
      ) : (
        <>
          <div className="flex items-center gap-3">
            <SearchField
              label="Rechercher dans les notes"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un titre ou un contenu…"
            />
            <span className="hidden text-xs text-muted-foreground sm:block">
              Résultats instantanés
            </span>
          </div>
          {query.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="h-52 animate-pulse bg-muted" />
            </div>
          ) : query.isError ? (
            <div
              role="alert"
              className="rounded-[20px] border border-destructive/30 p-5"
            >
              <p>Les notes sont indisponibles.</p>
              <Button
                className="mt-3"
                variant="outline"
                onClick={() => void query.refetch()}
              >
                Réessayer
              </Button>
            </div>
          ) : !notes.length ? (
            <Card className="relative min-h-64 items-center justify-center overflow-hidden rounded-[24px] border-dashed bg-muted/15 text-center shadow-none">
              <Sparkles className="size-9 text-muted-foreground" />
              <h3 className="text-lg font-semibold">
                {search
                  ? "Aucune note correspondante"
                  : "Votre bibliothèque est prête"}
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                {search
                  ? "La recherche se met à jour au fil de votre saisie."
                  : "Utilisez Créer dans le menu principal pour rédiger votre première note."}
              </p>
            </Card>
          ) : (
            <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  featured={note.is_pinned}
                  onOpen={() => setDetailNote(note)}
                  onEdit={() => setFormNote(note)}
                  onPin={() => void togglePin(note)}
                  onDelete={() => setNoteToDelete(note)}
                />
              ))}
            </div>
          )}
        </>
      )}
      {formNote !== undefined && (
        <NoteForm
          key={formNote?.id ?? "new"}
          note={formNote}
          busy={query.isMutating}
          onClose={() => setFormNote(undefined)}
          onSave={save}
        />
      )}
      <ConfirmDialog
        open={noteToDelete !== null}
        title="Supprimer cette note ?"
        description={
          noteToDelete
            ? `La note « ${noteToDelete.titre} » sera supprimée définitivement.`
            : undefined
        }
        confirmLabel="Supprimer"
        onCancel={() => setNoteToDelete(null)}
        onConfirm={() => void remove()}
      />
    </PageShell>
  );
}
