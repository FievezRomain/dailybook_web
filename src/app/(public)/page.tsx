import { withGuestPage } from '@/lib/auth/server/withGuestPage';

export default async function HomePage() {
  return withGuestPage(async () => (
    <main>
      <h1>Bienvenue sur Dailybook</h1>
      <p>
        <a href="/login">Se connecter</a> ou <a href="/register">Créer un compte</a>
      </p>
    </main>
  ));
}
