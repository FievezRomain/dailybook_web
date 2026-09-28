"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ExternalLink,
  Gift,
  Heart,
  MoreHorizontal,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/shared/components/feedback/ConfirmDialog";
import { SignedImage } from "@/shared/components/feedback/SignedImage";
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
import { cn } from "@/lib/utils";
import {
  deleteOrphanWishImage,
  getWishImageUrl,
  uploadWishImage,
} from "../api/wish-files";
import { useWishesQuery } from "../hooks/use-wishes";
import type { Wish } from "../types/wish";

export type WishValues = {
  nom: string;
  url: string;
  prix: string;
  destinataire: string;
  acquis: boolean;
  file?: File;
};

function recipientLabel(recipient: string) {
  return recipient.trim().replace(/^pour\s+/i, "");
}
type WishFilter = "all" | "wanted" | "acquired";

const ratios = [
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-[5/6]",
  "aspect-[4/3]",
];

function WishImage({
  wish,
  ratio = "aspect-[4/5]",
  detail = false,
}: {
  wish: Wish;
  ratio?: string;
  detail?: boolean;
}) {
  const imageQuery = useQuery({
    queryKey: ["wish-image", wish.id, wish.image],
    queryFn: () => getWishImageUrl(wish.image ?? "", wish.id),
    enabled: Boolean(wish.image),
    staleTime: 4 * 60_000,
  });
  const className = detail ? "min-h-80 h-full" : ratio;
  if (!wish.image)
    return (
      <div
        className={cn(
          "relative grid place-items-center overflow-hidden bg-gradient-to-br from-primary/[0.07] via-muted/70 to-alezan/15",
          className,
        )}
      >
        <div
          aria-hidden="true"
          className="absolute -bottom-10 -right-10 size-40 rounded-full border-[28px] border-primary/5"
        />
        <span className="grid size-16 place-items-center rounded-full bg-card text-primary shadow-surface">
          <Gift className="size-7" />
        </span>
      </div>
    );
  return (
    <div className={cn("overflow-hidden bg-muted", className)}>
      <SignedImage
        imageSigned={
          imageQuery.data
            ? { url: imageQuery.data, expiresAt: Number.MAX_SAFE_INTEGER }
            : undefined
        }
        alt={wish.nom || "Souhait"}
        width={720}
        height={900}
        classNames="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
        onErrorRefresh={() => void imageQuery.refetch()}
      />
    </div>
  );
}

export function WishForm({
  wish,
  busy,
  onClose,
  onSave,
}: {
  wish: Wish | null;
  busy: boolean;
  onClose: () => void;
  onSave: (values: WishValues) => Promise<void>;
}) {
  const [name, setName] = useState(wish?.nom ?? "");
  const [url, setUrl] = useState(wish?.url ?? "");
  const [price, setPrice] = useState(wish?.prix ?? "");
  const [recipient, setRecipient] = useState(wish?.destinataire ?? "");
  const [acquired, setAcquired] = useState(wish?.acquis ?? false);
  const [file, setFile] = useState<File>();
  const [confirmClose, setConfirmClose] = useState(false);
  const dirty =
    name !== (wish?.nom ?? "") ||
    url !== (wish?.url ?? "") ||
    price !== (wish?.prix ?? "") ||
    recipient !== (wish?.destinataire ?? "") ||
    acquired !== (wish?.acquis ?? false) ||
    Boolean(file);
  const urlIsValid = !url.trim() || /^https?:\/\/[^\s]+$/i.test(url.trim());
  const priceIsValid =
    !price.trim() || /^\d{1,7}(?:[.,]\d{1,2})?$/.test(price.trim());
  return (
    <>
      <SingleStepFormCard
        icon={Gift}
        eyebrow="Souhaits"
        title={wish ? "Modifier le souhait" : "Ajouter un souhait"}
        description="Rassemblez l’idée, son lien et son visuel dans une fiche claire."
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
              disabled={!name.trim() || !urlIsValid || !priceIsValid || busy}
              onClick={() =>
                void onSave({
                  nom: name.trim(),
                  url: url.trim(),
                  prix: price.trim(),
                  destinataire: recipient.trim(),
                  acquis: acquired,
                  file,
                })
              }
            >
              {wish ? "Enregistrer les modifications" : "Créer le souhait"}
            </Button>
          </>
        }
      >
        <FormSection
          title="Souhait"
          description="Le nom est obligatoire ; lien, prix, destinataire et image restent optionnels."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 sm:col-span-2">
              <span className="text-sm font-medium">Nom</span>
              <Input
                autoFocus
                required
                maxLength={255}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="grid gap-2 sm:col-span-2">
              <span className="text-sm font-medium">Lien</span>
              <Input
                type="url"
                maxLength={2048}
                placeholder="https://…"
                value={url}
                aria-invalid={!urlIsValid}
                onChange={(event) => setUrl(event.target.value)}
              />
              {!urlIsValid && (
                <span className="text-xs text-destructive">
                  Utilisez une adresse commençant par http:// ou https://.
                </span>
              )}
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Prix estimé</span>
              <Input
                inputMode="decimal"
                pattern="\d{1,7}([.,]\d{1,2})?"
                placeholder="0,00"
                value={price}
                aria-invalid={!priceIsValid}
                onChange={(event) => setPrice(event.target.value)}
              />
              {!priceIsValid && (
                <span className="text-xs text-destructive">
                  Saisissez au maximum 7 chiffres et 2 décimales.
                </span>
              )}
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Destinataire</span>
              <Input
                maxLength={255}
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
              />
            </label>
            <label className="grid gap-2 sm:col-span-2">
              <span className="text-sm font-medium">Image</span>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setFile(event.target.files?.[0])}
              />
              <span className="text-xs text-muted-foreground">
                L’image actuelle est conservée si aucun fichier n’est choisi.
              </span>
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={acquired}
                onChange={(event) => setAcquired(event.target.checked)}
              />
              Ce souhait est acquis
            </label>
          </div>
        </FormSection>
      </SingleStepFormCard>
      <ConfirmDialog
        open={confirmClose}
        title="Abandonner les modifications ?"
        description="Les valeurs saisies dans ce souhait seront perdues."
        confirmLabel="Abandonner"
        onCancel={() => setConfirmClose(false)}
        onConfirm={onClose}
      />
    </>
  );
}

function WishDetail({
  wish,
  onClose,
  onEdit,
}: {
  wish: Wish;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <article className="group mx-auto max-w-5xl overflow-hidden rounded-[28px] border bg-card shadow-surface">
      <div className="grid min-h-[520px] lg:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)]">
        <WishImage wish={wish} detail />
        <div className="flex min-w-0 flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <span
              className={cn(
                "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
                wish.acquis
                  ? "bg-success/10 text-success"
                  : "bg-primary/10 text-primary",
              )}
            >
              {wish.acquis ? (
                <Check className="size-3.5" />
              ) : (
                <Heart className="size-3.5" />
              )}
              {wish.acquis ? "Souhait acquis" : "À réaliser"}
            </span>
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            {wish.nom || "Souhait sans nom"}
          </h2>
          {wish.destinataire && (
            <p className="mt-2 text-sm text-muted-foreground">
              Pour {recipientLabel(wish.destinataire)}
            </p>
          )}
          <div className="my-7 border-y py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Prix estimé
            </p>
            <p className="mt-2 text-4xl font-semibold tracking-[-0.05em] tabular-nums">
              {wish.prix ? `${wish.prix.replace(".", ",")} €` : "—"}
            </p>
          </div>
          {wish.url && (
            <a
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              href={wish.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Voir le lien <ExternalLink className="size-4" />
            </a>
          )}
          <div className="mt-auto flex flex-col-reverse gap-2 pt-8 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onClose}>
              Retour aux souhaits
            </Button>
            <Button onClick={onEdit}>Modifier</Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function WishCard({
  wish,
  index,
  onOpen,
  onEdit,
  onToggle,
  onDelete,
}: {
  wish: Wish;
  index: number;
  onOpen: () => void;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      className={cn(
        "group mb-5 break-inside-avoid overflow-hidden rounded-[24px] border bg-card shadow-sm transition-[transform,box-shadow,border-color] hover:-translate-y-1 hover:border-primary/25 hover:shadow-surface motion-reduce:transform-none",
        wish.acquis && "opacity-80",
      )}
    >
      <div className="relative">
        <button
          className="block w-full text-left"
          onClick={onOpen}
          aria-label={wish.nom || "Souhait sans nom"}
        >
          <WishImage wish={wish} ratio={ratios[index % ratios.length]} />
        </button>
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur-md",
              wish.acquis
                ? "bg-success/10 text-success"
                : "bg-background/90 text-foreground",
            )}
          >
            {wish.acquis
              ? "Acquis"
              : wish.prix
                ? `${wish.prix.replace(".", ",")} €`
                : "Envie"}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full bg-background/90 shadow-sm backdrop-blur-md"
                aria-label={`Actions pour ${wish.nom || "ce souhait"}`}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onOpen}>
                Voir le détail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>Modifier</DropdownMenuItem>
              <DropdownMenuItem onClick={onToggle}>
                {wish.acquis ? "Marquer à faire" : "Marquer acquis"}
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="p-4">
        <button className="block w-full text-left" onClick={onOpen}>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-[-0.02em]">
            {wish.nom || "Souhait sans nom"}
          </h3>
          {wish.destinataire && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Pour {recipientLabel(wish.destinataire)}
            </p>
          )}
        </button>
        <div className="mt-3 flex items-center justify-between gap-2">
          {wish.prix ? (
            <strong className="text-sm tabular-nums">
              {wish.prix.replace(".", ",")} €
            </strong>
          ) : (
            <span className="text-xs text-muted-foreground">
              Prix à préciser
            </span>
          )}
          {wish.url && (
            <a
              className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
              href={wish.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ouvrir le lien de ${wish.nom || "ce souhait"}`}
            >
              <ExternalLink className="size-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function WishesContent({
  startCreating = false,
}: {
  startCreating?: boolean;
}) {
  const query = useWishesQuery();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<WishFilter>("all");
  const [formWish, setFormWish] = useState<Wish | null | undefined>(
    startCreating ? null : undefined,
  );
  const [detailWish, setDetailWish] = useState<Wish | null>(null);
  const [wishToDelete, setWishToDelete] = useState<Wish | null>(null);
  const allWishes = useMemo(() => query.wishes ?? [], [query.wishes]);
  const wishes = useMemo(
    () =>
      allWishes
        .filter((wish) =>
          `${wish.nom ?? ""} ${wish.destinataire ?? ""}`
            .toLocaleLowerCase("fr")
            .includes(search.trim().toLocaleLowerCase("fr")),
        )
        .filter(
          (wish) =>
            filter === "all" ||
            (filter === "acquired" ? wish.acquis : !wish.acquis),
        )
        .sort((a, b) => Number(a.acquis) - Number(b.acquis) || a.id - b.id),
    [allWishes, filter, search],
  );

  async function save(values: WishValues) {
    const input = {
      nom: values.nom,
      url: values.url || null,
      prix: values.prix || null,
      destinataire: values.destinataire || null,
      image: formWish?.image ?? null,
    };
    let uploaded: string | undefined;
    let resourceId = formWish?.id;
    let createdWish: Wish | undefined;
    try {
      if (formWish) {
        if (values.file)
          uploaded = await uploadWishImage(values.file, formWish.id);
        await query.updateWish(formWish.id, {
          ...input,
          image: uploaded ?? input.image,
          acquis: values.acquis,
        });
        if (uploaded && formWish.image && formWish.image !== uploaded)
          void deleteOrphanWishImage(formWish.image, formWish.id).catch(
            () => undefined,
          );
      } else {
        const created = await query.createWish(input);
        createdWish = created;
        resourceId = created.id;
        if (values.file) {
          uploaded = await uploadWishImage(values.file, created.id);
          await query.updateWish(created.id, {
            ...input,
            image: uploaded,
            acquis: values.acquis,
          });
        } else if (values.acquis)
          await query.updateWish(created.id, { ...input, acquis: true });
      }
      setFormWish(undefined);
      toast.success(formWish ? "Souhait mis à jour." : "Souhait créé.");
    } catch (error) {
      if (uploaded && resourceId)
        await deleteOrphanWishImage(uploaded, resourceId).catch(
          () => undefined,
        );
      if (createdWish) {
        setFormWish(createdWish);
        toast.error(
          "Le souhait a été créé sans son image. Vous pouvez réessayer depuis ce formulaire.",
        );
      } else
        toast.error(
          error instanceof Error
            ? error.message
            : "Le souhait n'a pas pu être enregistré.",
        );
    }
  }
  async function toggleAcquired(wish: Wish) {
    try {
      await query.updateWish(wish.id, {
        nom: wish.nom ?? "Souhait",
        url: wish.url ?? null,
        prix: wish.prix ?? null,
        destinataire: wish.destinataire ?? null,
        image: wish.image ?? null,
        acquis: !wish.acquis,
      });
    } catch {
      toast.error("Le statut du souhait n'a pas pu être modifié.");
    }
  }
  async function remove() {
    if (!wishToDelete) return;
    try {
      await query.deleteWish(wishToDelete.id);
      toast.success("Souhait supprimé.");
    } catch {
      toast.error("Le souhait n'a pas pu être supprimé.");
    } finally {
      setWishToDelete(null);
    }
  }

  const acquiredCount = allWishes.filter((wish) => wish.acquis).length;
  return (
    <PageShell className="space-y-6 pb-24">
      <PageHeader className="items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Liste de souhaits
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">
            Des envies qui prennent vie
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Rassemblez vos idées ici pour ne pas les oublier et plus facilement
            les partager.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold">
          <Sparkles className="size-4 text-primary" />
          {allWishes.length - acquiredCount} envie
          {allWishes.length - acquiredCount > 1 ? "s" : ""} · {acquiredCount}{" "}
          acquise{acquiredCount > 1 ? "s" : ""}
        </span>
      </PageHeader>
      {detailWish && formWish === undefined ? (
        <WishDetail
          wish={detailWish}
          onClose={() => setDetailWish(null)}
          onEdit={() => {
            setDetailWish(null);
            setFormWish(detailWish);
          }}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchField
              label="Rechercher dans les souhaits"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher une envie ou un destinataire…"
            />
            <div
              className="inline-flex w-fit rounded-[14px] bg-muted/60 p-1"
              role="tablist"
              aria-label="État des souhaits"
            >
              {(
                [
                  ["all", "Tous", allWishes.length],
                  ["wanted", "Envies", allWishes.length - acquiredCount],
                  ["acquired", "Acquis", acquiredCount],
                ] as const
              ).map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={filter === value}
                  onClick={() => setFilter(value)}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-1.5 rounded-[11px] px-3 text-xs font-semibold text-muted-foreground",
                    filter === value && "bg-card text-foreground shadow-sm",
                  )}
                >
                  {filter === value &&
                    (value === "acquired" ? (
                      <PackageCheck className="size-3.5 text-primary" />
                    ) : (
                      <Heart className="size-3.5 text-primary" />
                    ))}
                  {label}
                  <span className="tabular-nums opacity-70">{count}</span>
                </button>
              ))}
            </div>
          </div>
          {query.isLoading ? (
            <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="mb-5 h-72 break-inside-avoid animate-pulse rounded-[24px] bg-muted"
                />
              ))}
            </div>
          ) : query.isError ? (
            <div
              role="alert"
              className="rounded-[20px] border border-destructive/30 p-5"
            >
              <p>Les souhaits sont indisponibles.</p>
              <Button
                className="mt-3"
                variant="outline"
                onClick={() => void query.refetch()}
              >
                Réessayer
              </Button>
            </div>
          ) : !wishes.length ? (
            <Card className="min-h-64 items-center justify-center rounded-[24px] border-dashed bg-muted/15 text-center shadow-none">
              <Gift className="size-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">
                {search || filter !== "all"
                  ? "Aucun souhait correspondant"
                  : "Votre tableau est prêt"}
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                {search || filter !== "all"
                  ? "La sélection se met à jour instantanément."
                  : "Utilisez Créer dans le menu principal pour ajouter votre première inspiration."}
              </p>
            </Card>
          ) : (
            <div
              className="columns-1 gap-5 sm:columns-2 xl:columns-3"
              role="list"
              aria-label="Tableau des souhaits"
            >
              {wishes.map((wish, index) => (
                <div key={wish.id} role="listitem">
                  <WishCard
                    wish={wish}
                    index={index}
                    onOpen={() => setDetailWish(wish)}
                    onEdit={() => setFormWish(wish)}
                    onToggle={() => void toggleAcquired(wish)}
                    onDelete={() => setWishToDelete(wish)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {formWish !== undefined && (
        <WishForm
          key={formWish?.id ?? "new"}
          wish={formWish}
          busy={query.isMutating}
          onClose={() => setFormWish(undefined)}
          onSave={save}
        />
      )}
      <ConfirmDialog
        open={wishToDelete !== null}
        title="Supprimer ce souhait ?"
        description={
          wishToDelete
            ? `Le souhait « ${wishToDelete.nom || "sans nom"} » et son image seront supprimés.`
            : undefined
        }
        confirmLabel="Supprimer"
        onCancel={() => setWishToDelete(null)}
        onConfirm={() => void remove()}
      />
    </PageShell>
  );
}
