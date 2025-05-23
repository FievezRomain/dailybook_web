import * as admin from 'firebase-admin';
import fs from 'fs';

const path = process.env.FIREBASE_ADMIN_PATH || '';
const raw = fs.readFileSync(path, 'utf-8');
const serviceAccount = JSON.parse(raw);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
