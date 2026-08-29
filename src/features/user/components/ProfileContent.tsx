'use client';

import Image from 'next/image';
import { useCurrentUser } from '@/features/user/hooks/use-current-user';
import styles from '@/styles/pages/dashboard.module.scss';
import { UserPictureControl } from './UserPictureControl';

export default function ProfileContent() {
  const { user, isLoading, isError, refetch } = useCurrentUser();

  if (isLoading) {
    return <p role="status" className={styles.page_body}>Chargement du profil…</p>;
  }

  if (isError || !user) {
    return (
      <div role="alert" className={styles.page_body}>
        <p>Le profil ne peut pas être chargé.</p>
        <button type="button" onClick={() => void refetch()}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className={styles.page_body}>
      <div className={styles.page_container}>
        <div className={styles.page_section}>
          <div className={styles.page_desc}>
            <h1>Espace compte</h1>
            <div>
              <UserPictureControl />
              <h3>{user.name}</h3>
              <h4>{user.email}</h4>
            </div>
          </div>
        </div>
        <div className={styles.page_section}>
          <div className={styles.settings_group}>
            <h2>Paramètres</h2>
            <div />
            <a><Image src="/globe.svg" alt="" width={16} height={16} /> Changer mon mot de passe</a>
            <a><Image src="/globe.svg" alt="" width={16} height={16} /> Changer mon nom</a>
          </div>
          <div className={styles.settings_group}>
            <h2>Informations</h2>
            <div />
            <a><Image src="/globe.svg" alt="" width={16} height={16} /> Gérer mon abonnement</a>
            <a><Image src="/globe.svg" alt="" width={16} height={16} /> Support utilisateur</a>
            <a><Image src="/globe.svg" alt="" width={16} height={16} /> Passer en mode sombre</a>
            <a><Image src="/globe.svg" alt="" width={16} height={16} /> Supprimer mon compte</a>
            <a><Image src="/globe.svg" alt="" width={16} height={16} /> Déconnexion</a>
          </div>
        </div>
      </div>
    </div>
  );
}
