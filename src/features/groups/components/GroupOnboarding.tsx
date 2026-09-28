'use client';

import Link from 'next/link';
import { UsersRound } from 'lucide-react';

import { useCurrentUser } from '@/features/user/hooks/use-current-user';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useGroupInvitationsQuery, useGroupsQuery } from '../hooks/use-groups';

/**
 * A small, contextual entry point to group collaboration.
 *
 * It deliberately only appears when the backend confirms that the current user
 * has neither an active group nor a pending invitation. This keeps the Home
 * onboarding useful without turning it into a subscription/marketing surface.
 */
export function GroupOnboarding() {
  const { isPremium, isLoading: isUserLoading } = useCurrentUser();
  const groupsQuery = useGroupsQuery();
  const invitationsQuery = useGroupInvitationsQuery();

  if (
    isUserLoading
    || groupsQuery.isLoading
    || invitationsQuery.isLoading
    || groupsQuery.isError
    || invitationsQuery.isError
    || groupsQuery.groups?.length
    || invitationsQuery.invitations?.length
  ) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex min-w-0 items-start gap-3">
          <UsersRound aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="space-y-1">
            <h2 className="font-semibold">Coordonner un suivi à plusieurs</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {isPremium
                ? 'Utilisez Créer pour inviter les personnes de confiance et proposer les animaux dont vous êtes propriétaire.'
                : 'Vous pouvez rejoindre un groupe sur invitation, consulter son suivi et proposer vos propres animaux.'}
            </p>
          </div>
        </div>
        {!isPremium && <Button asChild variant="outline"><Link href="/groups">Voir mes invitations</Link></Button>}
      </CardContent>
    </Card>
  );
}
