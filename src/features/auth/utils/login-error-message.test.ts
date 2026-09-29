import { describe, expect, it } from "vitest";

import { getLoginErrorMessage } from "./login-error-message";

describe("getLoginErrorMessage", () => {
  it.each([
    ["auth/invalid-email", "L’adresse e-mail saisie n’est pas valide."],
    ["auth/missing-password", "Saisissez votre mot de passe."],
    ["auth/wrong-password", "Mot de passe incorrect."],
    [
      "auth/user-not-found",
      "Aucun compte ne correspond à cette adresse e-mail.",
    ],
    [
      "auth/invalid-credential",
      "Adresse e-mail ou mot de passe incorrect.",
    ],
    [
      "auth/user-disabled",
      "Ce compte a été désactivé. Contactez le support Vasco si vous pensez qu’il s’agit d’une erreur.",
    ],
    [
      "auth/too-many-requests",
      "Trop de tentatives ont été effectuées. Patientez quelques instants avant de réessayer.",
    ],
    [
      "auth/network-request-failed",
      "Impossible de joindre le service de connexion. Vérifiez votre connexion internet puis réessayez.",
    ],
  ])("traduit %s en message métier", (code, message) => {
    expect(getLoginErrorMessage({ code })).toBe(message);
  });

  it("ne révèle pas un message technique inconnu", () => {
    expect(
      getLoginErrorMessage(new Error("Firebase: Error (auth/unexpected).")),
    ).toBe(
      "La connexion n’a pas pu être finalisée. Vérifiez vos informations puis réessayez.",
    );
  });
});
