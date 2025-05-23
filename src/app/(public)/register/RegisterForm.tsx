'use client';

import { FormEvent, useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import styles from '@/styles/pages/login.module.scss';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      await fetch('/api/session/login', {
        method: 'POST',
        body: JSON.stringify({ token }),
        headers: { 'Content-Type': 'application/json' },
      });

      window.location.href = '/dashboard';
    } catch (err) {
      setError("Erreur lors de la création du compte.");
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
        <button type="submit">S’inscrire</button>
      </form>
      <p className={styles.link}>
        Déjà inscrit ? <a href="/login">Se connecter</a>
      </p>
    </div>
  );
}
