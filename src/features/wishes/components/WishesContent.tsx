'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ExternalLink, Gift, MoreHorizontal, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { Input } from '@/shared/components/ui/input';
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog';
import { SignedImage } from '@/shared/components/feedback/SignedImage';
import { PageHeader, PageShell, PageTitle } from '@/shared/components/layout/PageShell';
import { deleteOrphanWishImage, getWishImageUrl, uploadWishImage } from '../api/wish-files';
import { useWishesQuery } from '../hooks/use-wishes';
import type { Wish } from '../types/wish';

type WishValues = { nom: string; url: string; prix: string; destinataire: string; acquis: boolean; file?: File };

function WishImage({ wish }: { wish: Wish }) {
  const imageQuery = useQuery({
    queryKey: ['wish-image', wish.id, wish.image],
    queryFn: () => getWishImageUrl(wish.image ?? '', wish.id),
    enabled: Boolean(wish.image),
    staleTime: 4 * 60_000,
  });
  if (!wish.image) return <div className="flex aspect-[4/3] items-center justify-center rounded-surface bg-muted"><Gift className="size-10 text-muted-foreground" /></div>;
  return <div className="aspect-[4/3] overflow-hidden rounded-surface bg-muted"><SignedImage imageSigned={imageQuery.data ? { url: imageQuery.data, expiresAt: Number.MAX_SAFE_INTEGER } : undefined} alt="" width={480} height={360} classNames="h-full w-full object-cover" onErrorRefresh={() => void imageQuery.refetch()} /></div>;
}

function WishForm({ wish, busy, onClose, onSave }: { wish: Wish | null; busy: boolean; onClose: () => void; onSave: (values: WishValues) => Promise<void> }) {
  const [name, setName] = useState(wish?.nom ?? '');
  const [url, setUrl] = useState(wish?.url ?? '');
  const [price, setPrice] = useState(wish?.prix ?? '');
  const [recipient, setRecipient] = useState(wish?.destinataire ?? '');
  const [acquired, setAcquired] = useState(wish?.acquis ?? false);
  const [file, setFile] = useState<File>();
  const [confirmClose, setConfirmClose] = useState(false);
  const dirty = name !== (wish?.nom ?? '') || url !== (wish?.url ?? '') || price !== (wish?.prix ?? '') || recipient !== (wish?.destinataire ?? '') || acquired !== (wish?.acquis ?? false) || Boolean(file);
  const urlIsValid = !url.trim() || /^https?:\/\/[^\s]+$/i.test(url.trim());
  const priceIsValid = !price.trim() || /^\d{1,7}(?:[.,]\d{1,2})?$/.test(price.trim());
  function requestClose() { if (dirty) setConfirmClose(true); else onClose(); }

  return <>
    <Dialog open onOpenChange={(open) => { if (!open) requestClose(); }}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{wish ? 'Modifier le souhait' : 'Nouveau souhait'}</DialogTitle><DialogDescription>Ajoutez un lien HTTP(S) et, si utile, une image JPEG, PNG ou WebP de 750 Ko maximum.</DialogDescription></DialogHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 sm:col-span-2"><span className="text-sm font-medium">Nom</span><Input autoFocus required maxLength={255} value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="grid gap-2 sm:col-span-2"><span className="text-sm font-medium">Lien</span><Input type="url" maxLength={2048} placeholder="https://…" value={url} aria-invalid={!urlIsValid} onChange={(event) => setUrl(event.target.value)} />{!urlIsValid && <span className="text-xs text-destructive">Utilisez une adresse commençant par http:// ou https://.</span>}</label>
        <label className="grid gap-2"><span className="text-sm font-medium">Prix estimé</span><Input inputMode="decimal" pattern="\d{1,7}([.,]\d{1,2})?" placeholder="0,00" value={price} aria-invalid={!priceIsValid} onChange={(event) => setPrice(event.target.value)} />{!priceIsValid && <span className="text-xs text-destructive">Saisissez au maximum 7 chiffres et 2 décimales.</span>}</label>
        <label className="grid gap-2"><span className="text-sm font-medium">Destinataire</span><Input maxLength={255} value={recipient} onChange={(event) => setRecipient(event.target.value)} /></label>
        <label className="grid gap-2 sm:col-span-2"><span className="text-sm font-medium">Image</span><Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0])} /><span className="text-xs text-muted-foreground">L’image actuelle est conservée si aucun fichier n’est choisi.</span></label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={acquired} onChange={(event) => setAcquired(event.target.checked)} /> Ce souhait est acquis</label>
      </div>
      <DialogFooter><Button variant="ghost" onClick={requestClose}>Annuler</Button><Button disabled={!name.trim() || !urlIsValid || !priceIsValid || busy} onClick={() => void onSave({ nom: name.trim(), url: url.trim(), prix: price.trim(), destinataire: recipient.trim(), acquis: acquired, file })}>{wish ? 'Enregistrer' : 'Créer le souhait'}</Button></DialogFooter></DialogContent>
    </Dialog>
    <ConfirmDialog open={confirmClose} title="Abandonner les modifications ?" description="Les valeurs saisies dans ce souhait seront perdues." confirmLabel="Abandonner" onCancel={() => setConfirmClose(false)} onConfirm={onClose} />
  </>;
}

export default function WishesContent({ startCreating = false }: { startCreating?: boolean }) {
  const query = useWishesQuery();
  const [search, setSearch] = useState('');
  const [formWish, setFormWish] = useState<Wish | null | undefined>(startCreating ? null : undefined);
  const [wishToDelete, setWishToDelete] = useState<Wish | null>(null);
  const wishes = useMemo(() => (query.wishes ?? []).filter((wish) => `${wish.nom ?? ''} ${wish.destinataire ?? ''}`.toLocaleLowerCase('fr').includes(search.trim().toLocaleLowerCase('fr'))).sort((left, right) => Number(left.acquis) - Number(right.acquis) || left.id - right.id), [query.wishes, search]);

  async function save(values: WishValues) {
    const input = { nom: values.nom, url: values.url || null, prix: values.prix || null, destinataire: values.destinataire || null, image: formWish?.image ?? null };
    let uploaded: string | undefined;
    let resourceId = formWish?.id;
    let createdWish: Wish | undefined;
    try {
      if (formWish) {
        if (values.file) uploaded = await uploadWishImage(values.file, formWish.id);
        await query.updateWish(formWish.id, { ...input, image: uploaded ?? input.image, acquis: values.acquis });
        if (uploaded && formWish.image && formWish.image !== uploaded) void deleteOrphanWishImage(formWish.image, formWish.id).catch(() => undefined);
      } else {
        const created = await query.createWish(input);
        createdWish = created;
        resourceId = created.id;
        if (values.file) {
          uploaded = await uploadWishImage(values.file, created.id);
          await query.updateWish(created.id, { ...input, image: uploaded, acquis: values.acquis });
        } else if (values.acquis) await query.updateWish(created.id, { ...input, acquis: true });
      }
      setFormWish(undefined);
      toast.success(formWish ? 'Souhait mis à jour.' : 'Souhait créé.');
    } catch (error) {
      if (uploaded && resourceId) await deleteOrphanWishImage(uploaded, resourceId).catch(() => undefined);
      if (createdWish) {
        setFormWish(createdWish);
        toast.error('Le souhait a été créé sans son image. Vous pouvez réessayer depuis ce formulaire.');
      } else toast.error(error instanceof Error ? error.message : "Le souhait n'a pas pu être enregistré.");
    }
  }

  async function toggleAcquired(wish: Wish) {
    try { await query.updateWish(wish.id, { nom: wish.nom ?? 'Souhait', url: wish.url ?? null, prix: wish.prix ?? null, destinataire: wish.destinataire ?? null, image: wish.image ?? null, acquis: !wish.acquis }); }
    catch { toast.error("Le statut du souhait n'a pas pu être modifié."); }
  }
  async function remove() { if (!wishToDelete) return; try { await query.deleteWish(wishToDelete.id); toast.success('Souhait supprimé.'); } catch { toast.error("Le souhait n'a pas pu être supprimé."); } finally { setWishToDelete(null); } }

  return <PageShell className="pb-24">
    <PageHeader className="items-center"><div><PageTitle>Souhaits</PageTitle><p className="text-muted-foreground">Centralisez vos idées et marquez celles qui sont réalisées.</p></div><Button onClick={() => setFormWish(null)}><Plus className="size-4" /> Nouveau souhait</Button></PageHeader>
    <label className="relative block max-w-xl"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Rechercher dans les souhaits</span><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un souhait" /></label>
    {query.isLoading && <Card><CardContent className="py-12 text-muted-foreground">Chargement des souhaits…</CardContent></Card>}
    {query.isError && <div role="alert" className="rounded-overlay border border-destructive/40 p-surface"><p>Les souhaits sont indisponibles.</p><Button className="mt-3" variant="outline" onClick={() => void query.refetch()}>Réessayer</Button></div>}
    {!query.isLoading && !query.isError && !wishes.length && <Card><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><Gift className="size-10 text-muted-foreground" /><div><p className="font-medium">{search ? 'Aucun souhait correspondant' : 'Aucun souhait'}</p><p className="text-sm text-muted-foreground">{search ? 'Essayez une autre recherche.' : 'Ajoutez votre première idée.'}</p></div></CardContent></Card>}
    {!!wishes.length && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{wishes.map((wish) => <Card key={wish.id} className={wish.acquis ? 'opacity-75' : undefined}><CardHeader className="flex-row items-start justify-between gap-3"><CardTitle className="flex items-center gap-2"><span>{wish.nom || 'Souhait sans nom'}</span>{wish.acquis && <><Check className="size-4 text-primary" /><span className="sr-only">Acquis</span></>}</CardTitle><DropdownMenu><DropdownMenuTrigger asChild><Button size="icon" variant="ghost" aria-label={`Actions pour ${wish.nom || 'ce souhait'}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setFormWish(wish)}>Modifier</DropdownMenuItem><DropdownMenuItem onClick={() => void toggleAcquired(wish)}>{wish.acquis ? 'Marquer à faire' : 'Marquer acquis'}</DropdownMenuItem><DropdownMenuItem variant="destructive" onClick={() => setWishToDelete(wish)}>Supprimer</DropdownMenuItem></DropdownMenuContent></DropdownMenu></CardHeader><CardContent className="space-y-3"><WishImage wish={wish} /><div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span>{wish.prix ? `${wish.prix.replace('.', ',')} €` : 'Prix non renseigné'}</span><span className="text-muted-foreground">{wish.destinataire || 'Sans destinataire'}</span></div>{wish.url && <a className="inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline" href={wish.url} target="_blank" rel="noopener noreferrer">Voir le lien <ExternalLink className="size-4" /></a>}</CardContent></Card>)}</div>}
    {formWish !== undefined && <WishForm key={formWish?.id ?? 'new'} wish={formWish} busy={query.isMutating} onClose={() => setFormWish(undefined)} onSave={save} />}
    <ConfirmDialog open={wishToDelete !== null} title="Supprimer ce souhait ?" description={wishToDelete ? `Le souhait « ${wishToDelete.nom || 'sans nom'} » et son image seront supprimés.` : undefined} confirmLabel="Supprimer" onCancel={() => setWishToDelete(null)} onConfirm={() => void remove()} />
  </PageShell>;
}
