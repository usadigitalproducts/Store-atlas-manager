import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

export function initializeAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (!serviceAccount) {
    throw new Error('Firebase service account key is not set in environment variables.');
  }

  return initializeApp({
    credential: credential.cert(serviceAccount),
  });
}
