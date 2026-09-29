const loginErrorMessages: Record<string, string> = {
  "auth/invalid-email": "L’adresse e-mail saisie n’est pas valide.",
  "auth/missing-password": "Saisissez votre mot de passe.",
  "auth/wrong-password": "Mot de passe incorrect.",
  "auth/user-not-found": "Aucun compte ne correspond à cette adresse e-mail.",
  "auth/invalid-credential": "Adresse e-mail ou mot de passe incorrect.",
  "auth/invalid-login-credentials": "Adresse e-mail ou mot de passe incorrect.",
  "auth/user-disabled":
    "Ce compte a été désactivé. Contactez le support Vasco si vous pensez qu’il s’agit d’une erreur.",
  "auth/too-many-requests":
    "Trop de tentatives ont été effectuées. Patientez quelques instants avant de réessayer.",
  "auth/network-request-failed":
    "Impossible de joindre le service de connexion. Vérifiez votre connexion internet puis réessayez.",
  "auth/operation-not-allowed":
    "La connexion par adresse e-mail est temporairement indisponible.",
  "auth/internal-error":
    "Une erreur technique empêche la connexion. Réessayez dans quelques instants.",
};

function firebaseErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

export function getLoginErrorMessage(error: unknown) {
  const code = firebaseErrorCode(error);
  return (
    (code ? loginErrorMessages[code] : undefined) ??
    "La connexion n’a pas pu être finalisée. Vérifiez vos informations puis réessayez."
  );
}
