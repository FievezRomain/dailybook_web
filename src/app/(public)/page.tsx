import { Button } from '@/components/ui';
import { withGuestPage } from '@/lib/auth/server/withGuestPage';
import styles from '@/styles/pages/welcome.module.scss';
import Link from 'next/link';

export default async function HomePage() {
  return withGuestPage(async () => (
        <main>
                <div className={styles.welcome_page}>
                        <div className={styles.welcome_upper_page}>
                                <img src="/logo.png" alt="logo" className={styles.logo} />
                        </div>
                        <div className={styles.wave_wrapper}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                                        <path
                                                fill="rgb(var(--color-background-paper))"
                                                fillOpacity="1"
                                                d="M0,128L48,133.3C96,139,192,149,288,154.7C384,160,480,160,576,149.3C672,139,768,117,864,106.7C960,96,1056,96,1152,112C1248,128,1344,160,1392,176L1440,192L1440,320L0,320Z"
                                        />
                                </svg>
                        </div>
                        <div className={styles.welcome_bottom_page}>
                                <p className={`text-text ${styles.text}`}>MOINS DE CHARGE MENTALE, PLUS DE MOMENTS INESTIMABLES !</p>
                                <Button asChild size="lg">
                                        <Link href="/login">Vivre l'aventure</Link>
                                </Button>
                        </div>
                </div>
        </main>
  ));
}
