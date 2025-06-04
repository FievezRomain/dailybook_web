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
                <div className={styles.form_page}>
                        <h1 className={styles.brown_title}>S'inscrire</h1>
                        <div className={styles.container}>
                                <form onSubmit={handleSubmit}>
                                        <div>
                                                <label>
                                                        Email :
                                                        <input type="email"
                                                                value={email}
                                                                onChange={e => setEmail(e.target.value)}
                                                                required
                                                                placeholder="Email" />
                                                </label>
                                                <label>
                                                        Prénom :
                                                        <input type="text"
                                                                required
                                                                placeholder="Votre prénom" />
                                                </label>
                                        </div>
                                        <div>
                                                <label>
                                                        Mot de passe :
                                                        <input type="password"
                                                                value={password}
                                                                onChange={e => setPassword(e.target.value)}
                                                                required
                                                                placeholder="Mot de passe" />
                                                </label>
                                                <label>
                                                        Confirmation du mot de passe :
                                                        <input type="password"
                                                                required
                                                                placeholder="Confirmation du mot de passe" />
                                                </label>
                                        </div>
                                        {error && <p className={styles.error}>{error}</p>}
                                        <button className={styles.brown_button} type="submit">
                                                {loading ? 'Inscription...' : 'S’enregistrer'}
                                        </button>
                                </form>
                                <a className={styles.brown_link} href="/login">Vous avez déjà un compte ?</a>
                        </div>
                </div>
        );
}
