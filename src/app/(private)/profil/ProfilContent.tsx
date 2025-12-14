'use client';

import { getUser } from "@/services/user";
import { User } from "@/types/user";
import { getUserPicture } from "@/services/user_picture";
import { UserPicture } from "@/types/user_picture";
import useSWR from "swr";
import styles from '@/styles/pages/dashboard.module.scss';

type Props = {
        prenom: string;
        initialUser: User[];
        initialUserPicture: UserPicture[];
        token: string;
        email: string;
        filename: string;
};


export default function ProfilContent({ initialUser, initialUserPicture, token, prenom, email, filename }: Props) {
        const { data: user = initialUser, isLoading: isLoadingUser } = useSWR(['user', token], () => getUser(token));
        const { data: user_picture = initialUserPicture, isLoading: isLoadingUserPicture } = useSWR(['user_picture', token], () => getUserPicture(token));

        return (
                <div className={styles.page_body}>
                        <div className={styles.page_container /*Partie gauche*/}>
                                <div className={styles.page_section}>
                                        <div className={styles.page_desc}>
                                                <h1>
                                                        Espace compte
                                                </h1>
                                                <div>
                                                        <img src={filename}></img>
                                                        <h3>{prenom}</h3>
                                                        <h4>{email}</h4>
                                                </div>
                                        </div>

                                        {isLoadingUser && <p>Chargement des événements...</p>}
                                        {isLoadingUserPicture && <p>Chargement des événements...</p>}

                                </div>
                                <div className={styles.page_section /*Partie droite*/}>
                                        <div className={styles.settings_group}>
                                                <h2>Paramètres</h2>
                                                <div></div>
                                                <a>
                                                        <img src="/globe.svg"></img> Changer mon mot de passe
                                                </a>
                                                <a>
                                                        <img src="/globe.svg"></img> Changer mon nom
                                                </a>
                                        </div>
                                        <div className={styles.settings_group}>
                                                <h2>Informations</h2>
                                                <div></div>
                                                <a>
                                                        <img src="/globe.svg"></img> Gérer mon abonnement
                                                </a>
                                                <a>
                                                        <img src="/globe.svg"></img> Support utilisateur
                                                </a>
                                                <a>
                                                        <img src="/globe.svg"></img> Passer en mode sombre
                                                </a>
                                                <a>
                                                        <img src="/globe.svg"></img> Supprimer mon compte
                                                </a>
                                                <a>
                                                        <img src="/globe.svg"></img> Déconnexion
                                                </a>
                                        </div>

                                </div>
                        </div>
                </div>
        );
}
