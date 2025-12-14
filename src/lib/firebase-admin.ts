import * as admin from 'firebase-admin';
import { cert } from 'firebase-admin/app';

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;

if (!privateKey || !clientEmail || !projectId) {
  throw new Error("Missing Firebase admin environment variables");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: cert({
      privateKey: privateKey.replace(/\\n/g, "\n"),
      clientEmail,
      projectId,
    }),
  });
}

export default admin;
