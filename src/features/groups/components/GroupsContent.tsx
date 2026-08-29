'use client';

import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog';
import { usePremiumGate } from '@/shared/components/feedback/PremiumGate';
import { PageHeader, PageShell, PageTitle } from '@/shared/components/layout/PageShell';
import { useCurrentUser } from '@/features/user/hooks/use-current-user';
import { useGroupInvitationsQuery, useGroupsQuery } from '../hooks/use-groups';
import type { Group, GroupInvitation } from '../types/group';
import { getCurrentGroupRole } from '../utils/group-access';
import { GroupDetail } from './GroupDetail';

function GroupForm({ group, busy, onClose, onSubmit }: {
  group: Group | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string; informations: string | null }) => Promise<void>;
}) {
  const [name, setName] = useState(group?.name ?? '');
  const [informations, setInformations] = useState(group?.informations ?? '');

  return (
    <Dialog open onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{group ? 'Modifier le groupe' : 'Créer un groupe'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <label className="grid gap-2"><span className="text-sm font-medium">Nom</span><Input value={name} maxLength={255} onChange={(event) => setName(event.target.value)} /></label>
          <label className="grid gap-2"><span className="text-sm font-medium">Informations</span><Textarea value={informations} maxLength={2000} onChange={(event) => setInformations(event.target.value)} /></label>
        </div>
        <DialogFooter><Button variant="ghost" onClick={onClose}>Annuler</Button><Button disabled={!name.trim() || busy} onClick={() => void onSubmit({ name: name.trim(), informations: informations.trim() || null })}>{group ? 'Enregistrer' : 'Créer le groupe'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function GroupsContent() {
  const { user, isPremium, isLoading: isUserLoading } = useCurrentUser();
  const groupsQuery = useGroupsQuery();
  const invitationsQuery = useGroupInvitationsQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formGroup, setFormGroup] = useState<Group | null | undefined>(undefined);
  const [invitationToDecline, setInvitationToDecline] = useState<GroupInvitation | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const { openPremiumDialog, handlePremiumError } = usePremiumGate();

  const groups = groupsQuery.groups ?? [];
  const selectedGroup = groups.find((group) => group.id === selectedId) ?? groups[0] ?? null;

  async function saveGroup(values: { name: string; informations: string | null }) {
    try {
      if (formGroup) await groupsQuery.updateGroup(formGroup.id, values);
      else {
        const created = await groupsQuery.createGroup(values);
        setSelectedId(created.id);
      }
      setFormGroup(undefined);
      toast.success(formGroup ? 'Groupe mis à jour.' : 'Groupe créé.');
    } catch (error) {
      if (!await handlePremiumError(error, 'groupManagement')) toast.error("Le groupe n'a pas pu être enregistré.");
    }
  }

  async function respondInvitation(invitation: GroupInvitation, status: 'accepted' | 'declined') {
    try {
      const joined = await invitationsQuery.respondInvitation(invitation.id, { status });
      if (joined) setSelectedId(joined.id);
      toast.success(status === 'accepted' ? 'Invitation acceptée.' : 'Invitation refusée.');
    } catch { toast.error("L'invitation n'a pas pu être traitée."); }
    finally { setInvitationToDecline(null); }
  }

  async function removeGroup() {
    if (!groupToDelete) return;
    try { await groupsQuery.deleteGroup(groupToDelete.id); toast.success('Groupe supprimé.'); }
    catch (error) {
      if (!await handlePremiumError(error, 'groupManagement')) toast.error("Le groupe n'a pas pu être supprimé.");
    }
    finally { setGroupToDelete(null); }
  }

  if (isUserLoading || groupsQuery.isLoading || invitationsQuery.isLoading) return <PageShell><p>Chargement des groupes…</p></PageShell>;

  return (
    <PageShell className="pb-24">
      <PageHeader className="items-center">
        <div><PageTitle>Groupes</PageTitle><p className="text-muted-foreground">Partagez le suivi de vos animaux avec les personnes de confiance.</p></div>
        <Button onClick={() => isPremium ? setFormGroup(null) : openPremiumDialog('groupManagement')}><Plus className="size-4" /> Créer un groupe {!isPremium && '· Premium'}</Button>
      </PageHeader>

      {(groupsQuery.isError || invitationsQuery.isError) && <div role="alert" className="rounded-lg border border-destructive/40 p-4"><p>Une partie des groupes est indisponible.</p><Button className="mt-2" variant="outline" onClick={() => { void groupsQuery.refetch(); void invitationsQuery.refetch(); }}>Réessayer</Button></div>}

      {!!invitationsQuery.invitations?.length && <Card>
        <CardHeader><CardTitle>Invitations en attente</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {invitationsQuery.invitations.map((invitation) => <div key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"><div><p className="font-medium">{invitation.group_name}</p><p className="text-sm text-muted-foreground">Invitation de {invitation.proposed_by_name || 'un gestionnaire'}</p></div><div className="flex gap-2"><Button size="sm" disabled={invitationsQuery.isMutating} onClick={() => void respondInvitation(invitation, 'accepted')}>Accepter</Button><Button size="sm" variant="outline" disabled={invitationsQuery.isMutating} onClick={() => setInvitationToDecline(invitation)}>Refuser</Button></div></div>)}
        </CardContent>
      </Card>}

      {!groups.length ? <Card><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><Users className="size-10 text-muted-foreground" /><div><p className="font-medium">Aucun groupe actif</p><p className="text-sm text-muted-foreground">Vous pouvez accepter une invitation quel que soit votre abonnement.</p></div></CardContent></Card> : <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside className="space-y-2" aria-label="Groupes actifs">
          <p className="text-sm font-medium text-muted-foreground">Groupes actifs</p>
          {groups.map((group) => <Button key={group.id} variant={selectedGroup?.id === group.id ? 'secondary' : 'ghost'} className="h-auto w-full justify-start py-3 text-left" onClick={() => setSelectedId(group.id)}><span><span className="block font-medium">{group.name}</span><span className="block text-xs text-muted-foreground">{group.nb_members} membre{group.nb_members > 1 ? 's' : ''} · {group.nb_animaux} animal{group.nb_animaux > 1 ? 'aux' : ''}</span></span></Button>)}
        </aside>
        {selectedGroup && <div className="space-y-4"><GroupDetail key={selectedGroup.id} group={selectedGroup} onEdit={() => setFormGroup(selectedGroup)} />{getCurrentGroupRole(selectedGroup, user) === 'manager' && <Button variant="destructive" onClick={() => isPremium ? setGroupToDelete(selectedGroup) : openPremiumDialog('groupManagement')}>Supprimer le groupe {!isPremium && '· Premium'}</Button>}</div>}
      </div>}

      {formGroup !== undefined && <GroupForm key={formGroup?.id ?? 'create'} group={formGroup} busy={groupsQuery.isMutating} onClose={() => setFormGroup(undefined)} onSubmit={saveGroup} />}
      <ConfirmDialog open={Boolean(invitationToDecline)} title="Refuser cette invitation ?" description={invitationToDecline ? `Vous ne rejoindrez pas le groupe ${invitationToDecline.group_name}.` : undefined} confirmLabel="Refuser" onCancel={() => setInvitationToDecline(null)} onConfirm={() => invitationToDecline && void respondInvitation(invitationToDecline, 'declined')} />
      <ConfirmDialog open={Boolean(groupToDelete)} title="Supprimer ce groupe ?" description="Les liens de partage du groupe seront supprimés. Les animaux et leurs données d’origine seront conservés." confirmLabel="Supprimer" onCancel={() => setGroupToDelete(null)} onConfirm={() => void removeGroup()} />
    </PageShell>
  );
}
