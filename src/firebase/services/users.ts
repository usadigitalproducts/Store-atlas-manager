'use client';

import {
  getAuth,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword as firebaseUpdatePassword,
  type Auth,
} from 'firebase/auth';
import { doc, setDoc, type Firestore } from 'firebase/firestore';

interface UpdateUserPayload {
  firestore: Firestore;
  userId: string;
  name: string;
}

interface UpdatePasswordPayload {
  auth: Auth;
  currentPassword?: string;
  newPassword?: string;
}

// This is now a client-side function
export async function updateUser(payload: UpdateUserPayload) {
  const { firestore, userId, name } = payload;
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser || currentUser.uid !== userId) {
    throw new Error('You are not authorized to perform this action.');
  }

  try {
    // Update Firebase Auth display name
    await updateProfile(currentUser, { displayName: name });

    // Update Firestore user profile
    const userRef = doc(firestore, 'users', userId);
    // Use setDoc with merge to create or update the document
    await setDoc(userRef, { name }, { merge: true });

    return { success: true };
  } catch (error: any) {
    console.error('Error updating user:', error);
    throw new Error(error.message || 'Failed to update user.');
  }
}

// This is now a client-side function
export async function updateUserPassword(payload: UpdatePasswordPayload) {
  const { auth, currentPassword, newPassword } = payload;
  const user = auth.currentUser;

  if (!user || !user.email || !currentPassword || !newPassword) {
    throw new Error('Invalid arguments for updating password.');
  }

  try {
    // Re-authenticate the user to ensure they are the legitimate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // If re-authentication is successful, update the password
    await firebaseUpdatePassword(user, newPassword);

    return { success: true };
  } catch (error: any) {
    console.error('Error updating password:', error);
    // Provide more specific feedback for common errors
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error('The current password you entered is incorrect. Please try again.');
    }
    throw new Error(error.message || 'Failed to update password.');
  }
}
