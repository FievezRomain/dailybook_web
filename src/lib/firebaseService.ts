import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  AuthError,
} from 'firebase/auth';
import { auth } from './firebase';

export const signInUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = async (email: string, password: string, firstName: string) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: firstName.trim() });
      return credential;
    } catch (err) {
      const error = err as AuthError;
      switch (error.code) {
        case 'auth/invalid-email':
          throw new Error("Adresse e-mail invalide.");
        case 'auth/email-already-in-use':
          throw new Error("Cette adresse e-mail est déjà utilisée.");
        case 'auth/weak-password':
          throw new Error("Mot de passe trop faible (au moins 6 caractères).");
        default:
          throw new Error("Erreur inconnue lors de la création du compte.");
      }
    }
};

export const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      throw new Error('Aucun utilisateur connecté');
    }
};

export const isEmailVerified = async () => {
  const user = auth.currentUser;
  await user?.reload();
  return user?.emailVerified ?? false;
};
