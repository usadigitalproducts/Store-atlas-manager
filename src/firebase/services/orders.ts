'use server';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Function to create a new order
export async function createOrder(db: Firestore, userId: string, data: any) {
  const ordersCollectionRef = collection(db, 'users', userId, 'orders');
  const orderData = {
    ...data,
    createdBy: userId, // Set the owner of the document
    payoutStatus: 'waiting', // Default value
    createdAt: serverTimestamp(),
  };

  addDoc(ordersCollectionRef, orderData).catch((error) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: ordersCollectionRef.path,
        operation: 'create',
        requestResourceData: orderData,
      })
    );
  });
}

// Function to update an existing order
export async function updateOrder(
  db: Firestore,
  userId: string,
  orderId: string,
  data: any
) {
  const orderRef = doc(db, 'users', userId, 'orders', orderId);
  // Exclude fields that should not be editable by this function or are immutable
  const { storeOrderId, trackingNumber, orderDate, orderPrice, payoutStatus, createdBy, ...updateData } = data;

  updateDoc(orderRef, updateData).catch((error) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: orderRef.path,
        operation: 'update',
        requestResourceData: updateData,
      })
    );
  });
}
