import { withGuestPage } from '@/lib/auth/server/withGuestPage';
import styles from '@/styles/pages/login.module.scss';
import Image from 'next/image';

export default async function HomePage() {
        return withGuestPage(async () => (
                <main>
                        <div className={styles.welcome_page}>
                                <div className={styles.welcome_upper_page}>
                                        <img src="/logo.png" alt="logo" />
                                </div>
                                <div className={styles.welcome_bottom_page}>
                                        <p>MOINS DE CHARGE MENTALE, PLUS DE MOMENTS INESTIMABLES !</p>
                                        <a className={styles.white_button} href="/login">Vivre l'aventure</a>
                                </div>
                        </div>
                </main>
        ));
}
