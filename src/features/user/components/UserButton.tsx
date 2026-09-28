'use client';

import { LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { useCurrentUser } from '@/features/user/hooks/use-current-user';
import { useLogoutCurrentUser } from '@/features/user/hooks/use-logout-current-user';

export default function UserButton() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const logoutCurrentUser = useLogoutCurrentUser();
  const handleLogout = async () => {
    await logoutCurrentUser();
    router.replace('/login');
    router.refresh();
  };

  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" aria-label="Ouvrir le menu du compte">
        <Avatar className="size-8"><AvatarImage src={user?.pictureUrl} alt="Photo de profil" /><AvatarFallback>{user?.name?.slice(0, 1).toUpperCase() ?? 'V'}</AvatarFallback></Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" size="comfortable" aria-label="Menu du compte">
      <DropdownMenuLabel>{user?.name ?? 'Mon compte'}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild><Link href="/profile"><User className="size-4" /> Profil et apparence</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link href="/notifications#preferences"><Settings className="size-4" /> Notifications</Link></DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive" onClick={() => void handleLogout()}><LogOut className="size-4" /> Se déconnecter</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
