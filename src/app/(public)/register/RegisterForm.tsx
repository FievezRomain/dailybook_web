'use client';

import { FormEvent, useState } from 'react';
import styles from '@/styles/pages/login.module.scss';
import { registerUser } from '@/lib/firebaseService';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerUser(email, password);

      window.location.href = '/verify-email';
    } catch (err) {
      console.error(err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur inconnue est survenue.');
      }
      
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Créer un compte</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Mot de passe
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit">
          {loading ? 'Inscription...' : 'S’inscrire'}
        </button>
      </form>
      <p className={styles.link}>
        Déjà inscrit ? <a href="/login">Se connecter</a>
      </p>
    </div>
  );
}
