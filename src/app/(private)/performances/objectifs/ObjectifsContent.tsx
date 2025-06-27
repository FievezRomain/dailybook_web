'use client';

import { getObjectifs } from "@/api/objectifs";
import { Objectifs } from "@/types/objectifs";
import useSWR from "swr";
import styles from '@/styles/components/dashboard.module.scss';

type Props = {
        email: string;
        initialObjectifs: Objectifs[];
        token: string;
};

export default function ObjectifsContent({ initialObjectifs, token, email }: Props) {
        const { data: objectifs = initialObjectifs, isLoadingObjectifs } = useSWR(['objectifs', token], () => getObjectifs(token));

        return (
                <div className={styles.page_body}>
                        <div className={styles.page_container}>
                                <div className={styles.page_section /*Partie gauche*/}>
                                        <div className={styles.page_desc}>
                                                <h2>Performances</h2>
                                                <div className={styles.sub_pages}>
                                                        <a>Objectifs</a>
                                                        <a>Statistiques</a>
                                                </div>
                                        </div>
                                </div>
                                <div className={styles.page_section /*Partie droite*/}>
                                        <div className={styles.tab_large}>
                                                <div className={styles.tab_header}>
                                                        <span></span>
                                                        <p>
                                                                Objectifs
                                                        </p>
                                                        <span></span>
                                                </div>
                                                <div className={styles.tab_content}>

                                                </div>

                                        </div>
                                </div>

                        </div>
                </div>
        )
}