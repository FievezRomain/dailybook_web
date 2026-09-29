"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import {
  ContactForm,
  type ContactValues,
} from "@/features/contacts/components/ContactsContent";
import { useContactsQuery } from "@/features/contacts/hooks/use-contacts";
import { GroupForm } from "@/features/groups/components/GroupsContent";
import { useGroupsQuery } from "@/features/groups/hooks/use-groups";
import { NoteForm } from "@/features/notes/components/NotesContent";
import { useNotesQuery } from "@/features/notes/hooks/use-notes";
import {
  WishForm,
  type WishValues,
} from "@/features/wishes/components/WishesContent";
import {
  deleteOrphanWishImage,
  uploadWishImage,
} from "@/features/wishes/api/wish-files";
import { useWishesQuery } from "@/features/wishes/hooks/use-wishes";
import { usePremiumGate } from "@/shared/components/feedback/PremiumGate";

export type GlobalCreateEntity = "note" | "contact" | "wish" | "group";

type GlobalCreateContextValue = {
  openEntityForm: (entity: GlobalCreateEntity) => void;
};

const GlobalCreateContext = createContext<GlobalCreateContextValue | null>(null);

export function GlobalCreateProvider({ children }: { children: ReactNode }) {
  const [entity, setEntity] = useState<GlobalCreateEntity>();
  const value = useMemo(
    () => ({ openEntityForm: setEntity }),
    [],
  );

  return (
    <GlobalCreateContext.Provider value={value}>
      {children}
      {entity ? (
        <GlobalEntityCreateDialog
          key={entity}
          entity={entity}
          onClose={() => setEntity(undefined)}
        />
      ) : null}
    </GlobalCreateContext.Provider>
  );
}

export function useGlobalCreate() {
  const value = useContext(GlobalCreateContext);
  if (!value)
    throw new Error("useGlobalCreate doit être utilisé dans GlobalCreateProvider");
  return value;
}

function GlobalEntityCreateDialog({
  entity,
  onClose,
}: {
  entity: GlobalCreateEntity;
  onClose: () => void;
}) {
  if (entity === "note") return <GlobalNoteCreate onClose={onClose} />;
  if (entity === "contact") return <GlobalContactCreate onClose={onClose} />;
  if (entity === "wish") return <GlobalWishCreate onClose={onClose} />;
  return <GlobalGroupCreate onClose={onClose} />;
}

function GlobalNoteCreate({ onClose }: { onClose: () => void }) {
  const query = useNotesQuery();
  async function save(values: {
    titre: string;
    note: string;
    is_pinned: boolean;
  }) {
    try {
      await query.createNote(values);
      toast.success("Note créée.");
      onClose();
    } catch {
      toast.error("La note n'a pas pu être enregistrée.");
    }
  }
  return <NoteForm note={null} busy={query.isMutating} onClose={onClose} onSave={save} />;
}

function GlobalContactCreate({ onClose }: { onClose: () => void }) {
  const query = useContactsQuery();
  async function save(values: ContactValues) {
    try {
      await query.createContact(values);
      toast.success("Contact créé.");
      onClose();
    } catch {
      toast.error("Le contact n'a pas pu être enregistré.");
    }
  }
  return <ContactForm contact={null} busy={query.isMutating} onClose={onClose} onSave={save} />;
}

function GlobalWishCreate({ onClose }: { onClose: () => void }) {
  const query = useWishesQuery();
  async function save(values: WishValues) {
    const input = {
      nom: values.nom,
      url: values.url || null,
      prix: values.prix || null,
      destinataire: values.destinataire || null,
      image: null,
    };
    let uploaded: string | undefined;
    let createdId: number | undefined;
    try {
      const created = await query.createWish(input);
      createdId = created.id;
      if (values.file) {
        uploaded = await uploadWishImage(values.file, created.id);
        await query.updateWish(created.id, {
          ...input,
          image: uploaded,
          acquis: values.acquis,
        });
      } else if (values.acquis) {
        await query.updateWish(created.id, { ...input, acquis: true });
      }
      toast.success("Souhait créé.");
      onClose();
    } catch (error) {
      if (uploaded && createdId)
        await deleteOrphanWishImage(uploaded, createdId).catch(() => undefined);
      if (createdId) {
        toast.error(
          "Le souhait a été créé sans son image. Vous pourrez la réajouter depuis la page Souhaits.",
        );
        onClose();
        return;
      }
      toast.error(
        error instanceof Error
          ? error.message
          : "Le souhait n'a pas pu être enregistré.",
      );
    }
  }
  return <WishForm wish={null} busy={query.isMutating} onClose={onClose} onSave={save} />;
}

function GlobalGroupCreate({ onClose }: { onClose: () => void }) {
  const query = useGroupsQuery();
  const { handlePremiumError } = usePremiumGate();
  async function save(values: { name: string; informations: string | null }) {
    try {
      await query.createGroup(values);
      toast.success("Groupe créé.");
      onClose();
    } catch (error) {
      if (!await handlePremiumError(error, "groupManagement"))
        toast.error("Le groupe n'a pas pu être enregistré.");
    }
  }
  return <GroupForm group={null} busy={query.isMutating} onClose={onClose} onSubmit={save} />;
}
