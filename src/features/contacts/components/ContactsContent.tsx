"use client";

import { useMemo, useState } from "react";
import { Mail, MoreHorizontal, Phone, UserRound, Users } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/shared/components/feedback/ConfirmDialog";
import {
  FormSection,
  SingleStepFormCard,
} from "@/shared/components/forms/SteppedFormSheet";
import { PageHeader, PageShell } from "@/shared/components/layout/PageShell";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { SearchField } from "@/shared/components/ui/search-field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { useContactsQuery } from "../hooks/use-contacts";
import type { Contact, CreateContactInput } from "../types/contact";

type ContactValues = CreateContactInput;

function contactLetter(name: string) {
  const letter = name
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .charAt(0)
    .toLocaleUpperCase("fr");
  return /^[A-Z]$/.test(letter) ? letter : "#";
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toLocaleUpperCase("fr") || "?"
  );
}

function ContactForm({
  contact,
  busy,
  onClose,
  onSave,
}: {
  contact: Contact | null;
  busy: boolean;
  onClose: () => void;
  onSave: (values: ContactValues) => Promise<void>;
}) {
  const [name, setName] = useState(contact?.nom ?? "");
  const [profession, setProfession] = useState(contact?.profession ?? "");
  const [phone, setPhone] = useState(contact?.telephone ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [confirmClose, setConfirmClose] = useState(false);
  const emailIsValid =
    !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const dirty =
    name !== (contact?.nom ?? "") ||
    profession !== (contact?.profession ?? "") ||
    phone !== (contact?.telephone ?? "") ||
    email !== (contact?.email ?? "");
  return (
    <>
      <SingleStepFormCard
        icon={Users}
        eyebrow="Contacts"
        title={contact ? "Modifier le contact" : "Créer un contact"}
        description="Conservez les coordonnées des professionnels et personnes utiles à vos animaux."
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
              disabled={!name.trim() || !emailIsValid || busy}
              onClick={() =>
                void onSave({
                  nom: name.trim(),
                  profession: profession.trim() || null,
                  telephone: phone.trim() || null,
                  email_contact: email.trim() || null,
                })
              }
            >
              {contact ? "Enregistrer les modifications" : "Créer le contact"}
            </Button>
          </>
        }
      >
        <FormSection
          title="Identité et coordonnées"
          description="Le nom est obligatoire ; les autres informations peuvent être complétées plus tard."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">
                Nom <span aria-hidden="true">*</span>
              </span>
              <Input
                autoFocus
                required
                maxLength={255}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Profession</span>
              <Input
                maxLength={255}
                value={profession}
                onChange={(event) => setProfession(event.target.value)}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Téléphone</span>
              <Input
                type="tel"
                maxLength={50}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">E-mail</span>
              <Input
                type="email"
                maxLength={320}
                value={email}
                aria-invalid={!emailIsValid}
                onChange={(event) => setEmail(event.target.value)}
              />
              {!emailIsValid && (
                <span className="text-xs text-destructive">
                  Saisissez une adresse e-mail valide.
                </span>
              )}
            </label>
          </div>
        </FormSection>
      </SingleStepFormCard>
      <ConfirmDialog
        open={confirmClose}
        title="Abandonner les modifications ?"
        description="Les valeurs saisies dans ce contact seront perdues."
        confirmLabel="Abandonner"
        onCancel={() => setConfirmClose(false)}
        onConfirm={onClose}
      />
    </>
  );
}

function ContactSheet({
  contact,
  onClose,
  onEdit,
}: {
  contact: Contact | null;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
}) {
  return (
    <Sheet
      open={contact !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent width="regular" className="gap-0 overflow-y-auto p-0">
        <SheetHeader className="relative border-b bg-muted/20 px-6 py-8">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-[#ce9871]"
          />
          <span className="mb-4 grid size-16 place-items-center rounded-[20px] bg-primary/10 text-xl font-semibold text-primary">
            {contact ? initials(contact.nom) : ""}
          </span>
          <SheetTitle className="pr-10 text-2xl tracking-[-0.03em]">
            {contact?.nom ?? "Contact"}
          </SheetTitle>
          <SheetDescription>
            {contact?.profession || "Contact personnel"}
          </SheetDescription>
        </SheetHeader>
        {contact && (
          <div className="flex-1 space-y-3 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              Coordonnées
            </p>
            {contact.telephone && (
              <a
                className="flex min-h-14 items-center gap-3 rounded-[16px] border bg-card p-3 transition-colors hover:bg-muted/40"
                href={`tel:${contact.telephone}`}
              >
                <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                  <Phone className="size-4" />
                </span>
                <span>
                  <span className="block text-[11px] text-muted-foreground">
                    Téléphone
                  </span>
                  <span className="text-sm font-semibold">
                    {contact.telephone}
                  </span>
                </span>
              </a>
            )}
            {contact.email && (
              <a
                className="flex min-h-14 items-center gap-3 rounded-[16px] border bg-card p-3 transition-colors hover:bg-muted/40"
                href={`mailto:${contact.email}`}
              >
                <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                  <Mail className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] text-muted-foreground">
                    E-mail
                  </span>
                  <span className="block truncate text-sm font-semibold">
                    {contact.email}
                  </span>
                </span>
              </a>
            )}
            {!contact.telephone && !contact.email && (
              <div className="rounded-[16px] border border-dashed p-5 text-sm text-muted-foreground">
                Aucune coordonnée n’est encore renseignée.
              </div>
            )}
          </div>
        )}
        <SheetFooter className="border-t bg-muted/10 p-5">
          <Button variant="ghost" onClick={onClose}>
            Fermer
          </Button>
          {contact && <Button onClick={() => onEdit(contact)}>Modifier</Button>}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default function ContactsContent({
  startCreating = false,
}: {
  startCreating?: boolean;
}) {
  const query = useContactsQuery();
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState("");
  const [formContact, setFormContact] = useState<Contact | null | undefined>(
    startCreating ? null : undefined,
  );
  const [detailContact, setDetailContact] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const contacts = useMemo(
    () =>
      (query.contacts ?? [])
        .filter((contact) =>
          `${contact.nom} ${contact.profession ?? ""} ${contact.telephone ?? ""} ${contact.email ?? ""}`
            .toLocaleLowerCase("fr")
            .includes(search.trim().toLocaleLowerCase("fr")),
        )
        .sort((a, b) => a.nom.localeCompare(b.nom, "fr")),
    [query.contacts, search],
  );
  const groups = useMemo(
    () =>
      contacts.reduce<Record<string, Contact[]>>((result, contact) => {
        const letter = contactLetter(contact.nom);
        (result[letter] ??= []).push(contact);
        return result;
      }, {}),
    [contacts],
  );
  const availableLetters = Object.keys(groups).sort((a, b) =>
    a.localeCompare(b, "fr"),
  );

  async function save(values: ContactValues) {
    try {
      if (formContact) await query.updateContact(formContact.id, values);
      else await query.createContact(values);
      setFormContact(undefined);
      toast.success(formContact ? "Contact mis à jour." : "Contact créé.");
    } catch {
      toast.error("Le contact n'a pas pu être enregistré.");
    }
  }
  async function remove() {
    if (!contactToDelete) return;
    try {
      await query.deleteContact(contactToDelete.id);
      toast.success("Contact supprimé.");
    } catch {
      toast.error("Le contact n'a pas pu être supprimé.");
    } finally {
      setContactToDelete(null);
      setDetailContact(null);
    }
  }
  function goToLetter(letter: string) {
    setActiveLetter(letter);
    document
      .getElementById(`contact-letter-${letter}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <PageShell className="space-y-6 pb-24">
      <PageHeader className="items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Répertoire
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">
            Les bonnes personnes, au bon moment
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Professionnels, proches et contacts utiles sont classés comme dans
            votre téléphone.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold">
          <UserRound className="size-4 text-primary" />
          {query.contacts?.length ?? 0} contact
          {(query.contacts?.length ?? 0) > 1 ? "s" : ""}
        </span>
      </PageHeader>
      {
        <>
          <SearchField
            label="Rechercher un contact"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nom, profession, téléphone ou e-mail…"
          />
          {query.isLoading ? (
            <div className="h-48 animate-pulse rounded-[22px] bg-muted" />
          ) : query.isError ? (
            <div
              role="alert"
              className="rounded-[20px] border border-destructive/30 p-5"
            >
              <p>Les contacts sont indisponibles.</p>
              <Button
                className="mt-3"
                variant="outline"
                onClick={() => void query.refetch()}
              >
                Réessayer
              </Button>
            </div>
          ) : !contacts.length ? (
            <div className="grid min-h-64 place-items-center rounded-[24px] border border-dashed bg-muted/15 p-6 text-center">
              <div>
                <Users className="mx-auto size-9 text-muted-foreground" />
                <h3 className="mt-3 text-lg font-semibold">
                  {search
                    ? "Aucun contact correspondant"
                    : "Votre répertoire est prêt"}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {search
                    ? "Les résultats se mettent à jour pendant votre saisie."
                    : "Utilisez Créer dans le menu principal pour ajouter un contact."}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative grid grid-cols-[minmax(0,1fr)_28px] gap-3">
              <div className="overflow-hidden rounded-[24px] border bg-card shadow-sm">
                {availableLetters.map((letter) => (
                  <section
                    key={letter}
                    id={`contact-letter-${letter}`}
                    className="scroll-mt-20"
                    aria-labelledby={`contact-heading-${letter}`}
                  >
                    <h3
                      id={`contact-heading-${letter}`}
                      className="sticky top-0 z-10 border-b bg-background/95 px-5 py-2 text-sm font-bold text-primary backdrop-blur"
                    >
                      {letter}
                    </h3>
                    {groups[letter].map((contact) => (
                      <div
                        key={contact.id}
                        className="group flex min-h-20 items-center gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-muted/25"
                      >
                        <button
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          onClick={() => setDetailContact(contact)}
                        >
                          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {initials(contact.nom)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">
                              {contact.nom}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                              {contact.profession ||
                                contact.telephone ||
                                contact.email ||
                                "Coordonnées à compléter"}
                            </span>
                          </span>
                        </button>
                        <div className="flex items-center gap-1">
                          {contact.telephone && (
                            <a
                              href={`tel:${contact.telephone}`}
                              className="grid size-10 place-items-center rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
                              aria-label={`Appeler ${contact.nom}`}
                            >
                              <Phone className="size-4" />
                            </a>
                          )}
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="grid size-10 place-items-center rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
                              aria-label={`Écrire à ${contact.nom}`}
                            >
                              <Mail className="size-4" />
                            </a>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label={`Actions pour ${contact.nom}`}
                              >
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setDetailContact(contact)}
                              >
                                Voir le détail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setFormContact(contact)}
                              >
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setContactToDelete(contact)}
                              >
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </section>
                ))}
              </div>
              <nav
                className="sticky top-16 self-start"
                aria-label="Index alphabétique"
              >
                <div className="grid justify-items-center rounded-full bg-muted/60 py-2">
                  {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                    <button
                      key={letter}
                      type="button"
                      disabled={!groups[letter]}
                      aria-label={`Aller à la lettre ${letter}`}
                      onClick={() => goToLetter(letter)}
                      className="grid size-5 place-items-center rounded-full text-[9px] font-bold text-muted-foreground enabled:hover:bg-primary enabled:hover:text-primary-foreground disabled:opacity-25"
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </nav>
              <p className="sr-only" aria-live="polite">
                {activeLetter ? `Lettre ${activeLetter}` : ""}
              </p>
            </div>
          )}
        </>
      }
      {formContact !== undefined && (
        <ContactForm
          key={formContact?.id ?? "new"}
          contact={formContact}
          busy={query.isMutating}
          onClose={() => setFormContact(undefined)}
          onSave={save}
        />
      )}
      <ContactSheet
        contact={detailContact}
        onClose={() => setDetailContact(null)}
        onEdit={(contact) => {
          setDetailContact(null);
          setFormContact(contact);
        }}
      />
      <ConfirmDialog
        open={contactToDelete !== null}
        title="Supprimer ce contact ?"
        description={
          contactToDelete
            ? `Le contact « ${contactToDelete.nom} » sera supprimé définitivement.`
            : undefined
        }
        confirmLabel="Supprimer"
        onCancel={() => setContactToDelete(null)}
        onConfirm={() => void remove()}
      />
    </PageShell>
  );
}
