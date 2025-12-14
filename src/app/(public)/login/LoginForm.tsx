'use client';

import { FormEvent, useState } from 'react';
import { getIdToken } from 'firebase/auth';
import styles from '@/styles/pages/login.module.scss';
import { signInUser, isEmailVerified } from '@/lib/firebaseService';
import { Button } from '@/components/ui';
import Link from 'next/link';

export default function LoginForm() {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState<string | null>(null);
        const [loading, setLoading] = useState(false);

        const handleSubmit = async (e: FormEvent) => {
                e.preventDefault();
                setError(null);
                setLoading(true);

                try {
                        // 1. Authentification avec Firebase
                        const userCredential = await signInUser(email, password);
                        const user = userCredential.user;

                        // Vérification si l'utilisateur a son email validée
                        const verified = await isEmailVerified();
                        if (!verified) {
                                window.location.href = '/verify-email';
                                return;
                        }

                        // 2. Récupérer le idToken
                        const idToken = await getIdToken(user, true);

                        // 3. Envoyer ce token à l’API pour créer le cookie
                        const res = await fetch('/api/session/login', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ idToken: idToken }),
                        });

                        if (!res.ok) {
                                throw new Error('Erreur lors de la création du cookie de session');
                        }

                        // 4. Rediriger
                        window.location.href = '/dashboard';
                } catch (err) {
                        console.error(err);
                        if (err instanceof Error) {
                                setError(err.message);
                        } else {
                                setError("Email ou mot de passe incorrect");
                        }
                        setLoading(false);
                }
        };

        return (
                <div className={styles.form_page}>
                        <h1 className={styles.title}>Connexion</h1>
                        <div className={styles.container}>
                                <form onSubmit={handleSubmit}>
                                        <div className={styles.inputs_container}>
                                                <label>
                                                        Identifiant :
                                                        <input
                                                                type="email"
                                                                value={email}
                                                                onChange={e => setEmail(e.target.value)}
                                                                required
                                                                placeholder="Email"
                                                        />
                                                </label>


                                                <label>
                                                        Mot de passe :
                                                        <input
                                                                type="password"
                                                                value={password}
                                                                onChange={e => setPassword(e.target.value)}
                                                                required
                                                                placeholder="Mot de passe"
                                                        />
                                                </label>
                                                {error && <p className={styles.error}>{error}</p>}
                                        </div>
                                        <div className={styles.button_container}>
                                                <Button type="submit" size={"lg"} disabled={loading}>
                                                        {loading ? 'Connexion...' : 'Je me connecte'}
                                                </Button>
                                        </div>
                                        
                                </form>
                                <a className={styles.link}>Mot de passe oublié ?</a>
                                <Button asChild size={"lg"}>
                                        <Link href="/register">
                                                Pas de compte ? S'inscrire
                                        </Link>
                                </Button>
                        </div>
                </div>
        );
}
