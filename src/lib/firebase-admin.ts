import 'server-only';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const authEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

if (!projectId || (!authEmulatorHost && (!privateKey || !clientEmail))) {
  throw new Error("Missing Firebase admin environment variables");
}

const app = getApps()[0] ?? initializeApp(
  authEmulatorHost
    ? { projectId }
    : {
        credential: cert({
          privateKey: privateKey!.replace(/\\n/g, "\n"),
          clientEmail: clientEmail!,
          projectId,
        }),
      },
);

export const adminAuth = getAuth(app);
