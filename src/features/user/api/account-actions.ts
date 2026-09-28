import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { closeAuthenticatedSession } from "./user-api";

function authenticatedUser() {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }
  return user;
}

async function reauthenticate(password: string) {
  const user = authenticatedUser();
  const credential = EmailAuthProvider.credential(user.email!, password);
  await reauthenticateWithCredential(user, credential);
  return user;
}

export async function changeCurrentUserPassword(
  currentPassword: string,
  nextPassword: string,
) {
  const user = await reauthenticate(currentPassword);
  await updatePassword(user, nextPassword);
}

export async function deleteCurrentAccount(password: string) {
  const user = await reauthenticate(password);
  await deleteUser(user);
  await closeAuthenticatedSession().catch(() => undefined);
}

export async function logoutCurrentUser() {
  await Promise.allSettled([signOut(auth), closeAuthenticatedSession()]);
}
