'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { PawPrint, UserMinus, Users } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog';
import { PremiumNotice, usePremiumGate } from '@/shared/components/feedback/PremiumGate';
import { useAnimalsQuery } from '@/features/animals/hooks/use-animals';
import { useCurrentUser } from '@/features/user/hooks/use-current-user';
import { useGroupManagement, usePendingAnimalSharesQuery } from '../hooks/use-groups';
import type { Group } from '../types/group';
import { getAcceptedGroupMembers, getCurrentGroupRole, getGroupAnimals, getPendingGroupMembers } from '../utils/group-access';

type Confirmation =
  | { kind: 'member'; email: string; own: boolean }
  | { kind: 'animal'; id: number; name: string }
  | { kind: 'share'; id: number; name: string; status: 'accepted' | 'declined' }
  | null;

function ManagerRequests({ group }: { group: Group }) {
  const { shares, isLoading, isError, respondAnimalShare, isMutating } = usePendingAnimalSharesQuery(group.id);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);

  async function confirm() {
    if (!confirmation || confirmation.kind !== 'share') return;
    try {
      await respondAnimalShare(confirmation.id, {
        status: confirmation.status,
        animaux: [shares?.find((share) => share.id === confirmation.id)?.animal_id ?? 0].filter(Boolean),
      });
      toast.success(confirmation.status === 'accepted' ? 'Animal ajouté au groupe.' : 'Proposition refusée.');
    } catch {
      toast.error("La proposition n'a pas pu être traitée.");
    } finally {
      setConfirmation(null);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Propositions d’animaux</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Chargement des propositions…</p>}
        {isError && <p role="alert" className="text-sm text-destructive">Les propositions sont indisponibles.</p>}
        {!isLoading && !shares?.length && <p className="text-sm text-muted-foreground">Aucune proposition en attente.</p>}
        {shares?.map((share) => (
          <div key={share.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
            <div><p className="font-medium">{share.animal_name}</p><p className="text-sm text-muted-foreground">Proposé par {share.proposed_by_name || 'un membre'}</p></div>
            <div className="flex gap-2">
              <Button size="sm" disabled={isMutating} onClick={() => setConfirmation({ kind: 'share', id: share.id, name: share.animal_name, status: 'accepted' })}>Accepter</Button>
              <Button size="sm" variant="outline" disabled={isMutating} onClick={() => setConfirmation({ kind: 'share', id: share.id, name: share.animal_name, status: 'declined' })}>Refuser</Button>
            </div>
          </div>
        ))}
      </CardContent>
      <ConfirmDialog open={confirmation?.kind === 'share'} title={confirmation?.kind === 'share' && confirmation.status === 'accepted' ? 'Accepter cet animal ?' : 'Refuser cette proposition ?'} description={confirmation?.kind === 'share' ? `Cette décision concerne ${confirmation.name}.` : undefined} confirmLabel={confirmation?.kind === 'share' && confirmation.status === 'accepted' ? 'Accepter' : 'Refuser'} onCancel={() => setConfirmation(null)} onConfirm={() => void confirm()} />
    </Card>
  );
}

export function GroupDetail({ group, onEdit }: { group: Group; onEdit: () => void }) {
  const { user, isPremium } = useCurrentUser();
  const { openPremiumDialog, handlePremiumError } = usePremiumGate();
  const { animals } = useAnimalsQuery();
  const management = useGroupManagement(group.id);
  const role = getCurrentGroupRole(group, user);
  const isManager = role === 'manager';
  const canManage = isManager && isPremium;
  const acceptedMembers = getAcceptedGroupMembers(group);
  const pendingMembers = getPendingGroupMembers(group);
  const acceptedAnimals = getGroupAnimals(group, 'accepted');
  const pendingAnimals = getGroupAnimals(group, 'pending');
  const sharedIds = new Set([...acceptedAnimals, ...pendingAnimals].map((animal) => animal.id));
  const ownedCandidates = (animals ?? []).filter((animal) => animal.provenance === 'owner' && !sharedIds.has(animal.id));
  const ownedIds = new Set((animals ?? []).filter((animal) => animal.provenance === 'owner').map((animal) => animal.id));
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedAnimals, setSelectedAnimals] = useState<number[]>([]);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);

  async function invite() {
    const members = inviteEmail.split(/[;,\s]+/).map((email) => email.trim()).filter(Boolean);
    if (!members.length) return;
    try { await management.inviteMembers({ members }); setInviteEmail(''); toast.success('Invitation envoyée.'); }
    catch (error) {
      if (!await handlePremiumError(error, 'groupManagement')) toast.error("L'invitation n'a pas pu être envoyée.");
    }
  }

  async function propose() {
    if (!selectedAnimals.length) return;
    try { await management.proposeAnimals({ animals: selectedAnimals }); setSelectedAnimals([]); toast.success('Proposition enregistrée.'); }
    catch { toast.error("Les animaux n'ont pas pu être proposés."); }
  }

  async function confirmRemoval() {
    if (!confirmation) return;
    try {
      if (confirmation.kind === 'member') await management.removeMember({ email: confirmation.email });
      if (confirmation.kind === 'animal') await management.removeAnimal(confirmation.id);
      toast.success(confirmation.kind === 'member' && confirmation.own ? 'Vous avez quitté le groupe.' : 'Le partage a été retiré.');
    } catch (error) {
      if (!await handlePremiumError(error, 'groupManagement')) toast.error("L'action n'a pas pu être réalisée.");
    }
    finally { setConfirmation(null); }
  }

  return (
    <section className="space-y-5" aria-labelledby="group-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 id="group-title" className="text-2xl font-semibold">{group.name}</h2>{group.informations && <p className="mt-1 text-muted-foreground">{group.informations}</p>}</div>
        <div className="flex gap-2">
          {isManager && <Button variant="outline" onClick={() => canManage ? onEdit() : openPremiumDialog('groupManagement')}>Modifier {!canManage && '· Premium'}</Button>}
          {role === 'member' && user && <Button variant="outline" onClick={() => setConfirmation({ kind: 'member', email: user.email, own: true })}>Quitter le groupe</Button>}
        </div>
      </div>

      {isManager && !isPremium && <PremiumNotice feature="groupManagement" />}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="size-5" /> Membres</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {acceptedMembers.map((member) => <div key={member.user_id} className="flex items-center justify-between gap-3 rounded-lg border p-3"><div><p className="font-medium">{member.prenom || member.email}</p><p className="text-sm text-muted-foreground">{member.role === 'manager' ? 'Gestionnaire' : member.email}</p></div>{canManage && member.role === 'member' && <Button size="sm" variant="ghost" aria-label={`Retirer ${member.prenom || member.email}`} onClick={() => setConfirmation({ kind: 'member', email: member.email, own: false })}><UserMinus className="size-4" /></Button>}</div>)}
            {pendingMembers.length > 0 && <div><p className="mb-2 text-sm font-medium">Invitations en attente</p>{pendingMembers.map((member) => <p key={member.email} className="text-sm text-muted-foreground">{member.email}</p>)}</div>}
            {canManage && <div className="flex gap-2 pt-2"><Input type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="membre@exemple.fr" aria-label="Adresse email à inviter" /><Button disabled={!inviteEmail.trim() || management.isMutating} onClick={() => void invite()}>Inviter</Button></div>}
            {isManager && !canManage && <Button size="sm" variant="outline" onClick={() => openPremiumDialog('groupManagement')}>Inviter un membre · Premium</Button>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><PawPrint className="size-5" /> Animaux partagés</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {!acceptedAnimals.length && <p className="text-sm text-muted-foreground">Aucun animal accepté.</p>}
            {acceptedAnimals.map((animal) => <div key={animal.id} className="flex items-center justify-between gap-3 rounded-lg border p-3"><div><p className="font-medium">{animal.nom || 'Animal sans nom'}</p><p className="text-sm text-muted-foreground">{animal.espece || 'Espèce non renseignée'}</p></div>{(canManage || ownedIds.has(animal.id)) && <Button size="sm" variant="ghost" onClick={() => setConfirmation({ kind: 'animal', id: animal.id, name: animal.nom || 'cet animal' })}>Retirer</Button>}</div>)}
            {pendingAnimals.length > 0 && <div><p className="mb-2 text-sm font-medium">En attente de validation</p>{pendingAnimals.map((animal) => <p key={animal.id} className="text-sm text-muted-foreground">{animal.nom || `Animal ${animal.id}`}</p>)}</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Proposer mes animaux</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Seuls les animaux dont vous êtes directement propriétaire peuvent être proposés.</p>
          {!ownedCandidates.length && <p className="text-sm">Tous vos animaux sont déjà proposés ou partagés avec ce groupe.</p>}
          {ownedCandidates.map((animal) => <label key={animal.id} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"><input type="checkbox" checked={selectedAnimals.includes(animal.id)} onChange={(event) => setSelectedAnimals((current) => event.target.checked ? [...current, animal.id] : current.filter((id) => id !== animal.id))} /><span>{animal.nom || 'Animal sans nom'}</span></label>)}
          <Button disabled={!selectedAnimals.length || management.isMutating} onClick={() => void propose()}>Proposer la sélection</Button>
        </CardContent>
      </Card>

      {canManage && <ManagerRequests group={group} />}
      <ConfirmDialog open={confirmation?.kind === 'member' || confirmation?.kind === 'animal'} title={confirmation?.kind === 'member' ? (confirmation.own ? 'Quitter ce groupe ?' : 'Retirer ce membre ?') : 'Retirer cet animal ?'} description={confirmation?.kind === 'member' && confirmation.own ? 'Vos partages et leurs liens aux événements de ce groupe seront retirés, sans supprimer vos données d’origine.' : confirmation?.kind === 'animal' ? `Le partage de ${confirmation.name} et ses liens aux événements du groupe seront retirés. L’animal et son historique seront conservés.` : 'Le membre perdra son accès au groupe.'} confirmLabel={confirmation?.kind === 'member' && confirmation.own ? 'Quitter' : 'Retirer'} onCancel={() => setConfirmation(null)} onConfirm={() => void confirmRemoval()} />
    </section>
  );
}
