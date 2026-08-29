'use client';

import { useState } from 'react';
import { Bell, BellOff, CheckCheck, Info, PawPrint, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/features/user/hooks/use-current-user';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog';
import { PageHeader, PageShell, PageTitle } from '@/shared/components/layout/PageShell';
import { useNotificationGroupActions, useNotificationPreferencesMutation, useNotificationsQuery } from '../hooks/use-notifications';
import type { Notification } from '../types/notification';

type Confirmation =
  | { kind: 'delete'; notification: Notification }
  | { kind: 'action'; notification: Notification; status: 'accepted' | 'declined' }
  | null;

const notificationIcons = {
  group_member: UserPlus,
  group_animal: PawPrint,
  structure: Info,
  system: Bell,
} as const;

function formatNotificationDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function NotificationsContent() {
  const notificationsQuery = useNotificationsQuery();
  const groupActions = useNotificationGroupActions();
  const preferences = useNotificationPreferencesMutation();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const [confirmation, setConfirmation] = useState<Confirmation>(null);

  async function markAllRead() {
    try { await notificationsQuery.markAllRead(); toast.success('Toutes les notifications sont lues.'); }
    catch { toast.error("Les notifications n'ont pas pu être mises à jour."); }
  }

  async function toggleRead(notification: Notification) {
    try { await notificationsQuery.setRead(notification.id, !notification.is_read); }
    catch { toast.error("La notification n'a pas pu être mise à jour."); }
  }

  async function confirm() {
    if (!confirmation) return;
    try {
      if (confirmation.kind === 'delete') {
        await notificationsQuery.deleteNotification(confirmation.notification.id);
        toast.success('Notification supprimée.');
      } else if (confirmation.notification.type === 'group_member' || confirmation.notification.type === 'group_animal') {
        await groupActions.respond({
          type: confirmation.notification.type,
          objectId: confirmation.notification.object_id,
          status: confirmation.status,
        });
        await notificationsQuery.setRead(confirmation.notification.id, true);
        toast.success(confirmation.status === 'accepted' ? 'Demande acceptée.' : 'Demande refusée.');
      }
    } catch { toast.error("L'action n'a pas pu être réalisée."); }
    finally { setConfirmation(null); }
  }

  async function updateDailyReminder(enabled: boolean) {
    try {
      await preferences.updatePreferences({ dailyReminderEnabled: enabled });
      toast.success(enabled ? 'Rappel quotidien activé.' : 'Rappel quotidien désactivé.');
    } catch { toast.error("La préférence n'a pas pu être enregistrée."); }
  }

  if (notificationsQuery.isLoading || isUserLoading) return <PageShell><p role="status">Chargement des notifications…</p></PageShell>;

  return (
    <PageShell className="pb-24">
      <PageHeader className="items-center">
        <div><PageTitle>Notifications</PageTitle><p className="text-muted-foreground">{notificationsQuery.unreadCount} non lue{notificationsQuery.unreadCount > 1 ? 's' : ''}</p></div>
        {notificationsQuery.unreadCount > 0 && <Button variant="outline" disabled={notificationsQuery.isMutating} onClick={() => void markAllRead()}><CheckCheck className="size-4" /> Tout marquer comme lu</Button>}
      </PageHeader>

      {notificationsQuery.isError && <div role="alert" className="rounded-surface border border-destructive/50 bg-destructive/10 p-surface"><p className="font-medium">Notifications indisponibles</p><p className="text-sm">La liste n’a pas pu être chargée.</p><Button className="mt-control" variant="outline" onClick={() => void notificationsQuery.refetch()}>Réessayer</Button></div>}

      {!notificationsQuery.isError && !notificationsQuery.notifications?.length && <Card><CardContent className="flex flex-col items-center gap-control py-section text-center"><BellOff className="size-10 text-muted-foreground" aria-hidden="true" /><div><p className="font-medium">Aucune notification</p><p className="text-sm text-muted-foreground">Les nouvelles invitations et informations apparaîtront ici.</p></div></CardContent></Card>}

      {!!notificationsQuery.notifications?.length && <section className="space-y-control" aria-label="Liste des notifications">
        {notificationsQuery.notifications.map((notification) => {
          const Icon = notificationIcons[notification.type];
          const date = formatNotificationDate(notification.created_at);
          const actionable = notification.action_available && (notification.type === 'group_member' || notification.type === 'group_animal');
          return <article key={notification.id} className={`rounded-surface border p-surface shadow-surface ${notification.is_read ? 'bg-card' : 'border-primary/50 bg-primary/5'}`}>
            <div className="flex gap-surface">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground"><Icon className="size-5" aria-hidden="true" /></span>
              <div className="min-w-0 flex-1 space-y-control">
                <div className="flex flex-wrap items-start justify-between gap-control"><div><div className="flex flex-wrap items-center gap-control"><h2 className="font-semibold">{notification.title}</h2>{!notification.is_read && <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">Non lue</span>}</div>{date && <time className="text-xs text-muted-foreground" dateTime={notification.created_at ?? undefined}>{date}</time>}</div></div>
                <p className="text-sm">{notification.message}</p>
                {notification.proposed_by && <p className="text-xs text-muted-foreground">Proposé par {notification.proposed_by}</p>}
                {actionable && <div className="flex flex-wrap gap-control"><Button size="sm" disabled={groupActions.isPending} onClick={() => setConfirmation({ kind: 'action', notification, status: 'accepted' })}>Accepter</Button><Button size="sm" variant="outline" disabled={groupActions.isPending} onClick={() => setConfirmation({ kind: 'action', notification, status: 'declined' })}>Refuser</Button></div>}
                {!notification.action_available && (notification.type === 'group_member' || notification.type === 'group_animal') && <p className="text-xs font-medium text-muted-foreground">Demande déjà traitée</p>}
                <div className="flex flex-wrap gap-control border-t pt-control"><Button size="sm" variant="ghost" disabled={notificationsQuery.isMutating} onClick={() => void toggleRead(notification)}>{notification.is_read ? 'Marquer comme non lue' : 'Marquer comme lue'}</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => setConfirmation({ kind: 'delete', notification })}><Trash2 className="size-4" /> Supprimer</Button></div>
              </div>
            </div>
          </article>;
        })}
      </section>}

      <Card id="preferences">
        <CardHeader><CardTitle>Préférences</CardTitle></CardHeader>
        <CardContent>
          <label className="flex cursor-pointer items-start justify-between gap-surface rounded-surface border p-surface">
            <span><span className="block font-medium">Rappel quotidien</span><span className="block text-sm text-muted-foreground">Recevoir le récapitulatif quotidien calculé par Vasco.</span></span>
            <input type="checkbox" className="mt-1 size-5 accent-primary" checked={user?.dailyReminderEnabled ?? false} disabled={preferences.isPending} onChange={(event) => void updateDailyReminder(event.target.checked)} />
          </label>
        </CardContent>
      </Card>

      <ConfirmDialog open={Boolean(confirmation)} title={confirmation?.kind === 'delete' ? 'Supprimer cette notification ?' : confirmation?.status === 'accepted' ? 'Accepter cette demande ?' : 'Refuser cette demande ?'} description={confirmation?.kind === 'delete' ? 'Cette notification sera définitivement retirée de votre liste.' : 'Cette décision mettra immédiatement à jour le groupe concerné.'} confirmLabel={confirmation?.kind === 'delete' ? 'Supprimer' : confirmation?.status === 'accepted' ? 'Accepter' : 'Refuser'} onCancel={() => setConfirmation(null)} onConfirm={() => void confirm()} />
    </PageShell>
  );
}
