import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, AuthError } from 'firebase/auth';
import { auth } from './firebase';

export const signInUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = async (email: string, password: string) => {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
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
  try{
    const user = auth.currentUser;
    await user?.reload();
    return user?.emailVerified ?? false;
  } catch (error) {
    const err = error as AuthError;

    switch (err.code) {
      case 'auth/invalid-email':
        throw new Error("Adresse e-mail invalide.");
      case 'auth/user-disabled':
        throw new Error("Ce compte a été désactivé.");
      case 'auth/user-not-found':
        throw new Error("Aucun utilisateur ne correspond à cet e-mail.");
      case 'auth/wrong-password':
        throw new Error("Mot de passe incorrect.");
      default:
        throw new Error("Erreur inconnue lors de la connexion.");
    }
  }
};
