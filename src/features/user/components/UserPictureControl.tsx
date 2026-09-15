'use client';

import { useId } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { useCurrentUser } from '@/features/user/hooks/use-current-user';
import { useUserPictureMutations } from '@/features/user/hooks/use-user-picture-mutations';

export function UserPictureControl() {
  const inputId = useId();
  const { user } = useCurrentUser();
  const { uploadPicture, removePicture, isPending, error, reset } = useUserPictureMutations();

  async function onFile(file?: File) {
    if (!file) return;
    reset();
    try {
      await uploadPicture(file);
    } catch {}
  }

  async function onRemove() {
    if (!window.confirm('Supprimer votre photo de profil ?')) return;
    reset();
    try {
      await removePicture();
    } catch {}
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <Avatar className="h-28 w-28 border-4 border-background shadow-surface">
        <AvatarImage src={user?.pictureUrl} alt="Photo de profil" />
        <AvatarFallback>{user?.name?.slice(0, 1).toUpperCase() ?? 'V'}</AvatarFallback>
      </Avatar>
      <div className="flex flex-wrap gap-1">
        <Button asChild variant="ghost" size="sm" disabled={isPending}>
          <label htmlFor={inputId}><Camera className="size-4" />{isPending ? 'Traitement…' : 'Changer'}</label>
        </Button>
        <input
          id={inputId}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={isPending}
          onChange={(event) => void onFile(event.target.files?.[0])}
        />
        {user?.picture && (
          <Button variant="ghost" size="sm" className="text-destructive" disabled={isPending} onClick={() => void onRemove()}>
            <Trash2 className="size-4" />Supprimer
          </Button>
        )}
      </div>
      <p className="sr-only">JPEG, PNG ou WebP, 500 Ko maximum.</p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'La photo ne peut pas être mise à jour.'}
        </p>
      )}
    </div>
  );
}
