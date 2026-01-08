'use server';
import {
  collection,
  addDoc,
  serverTimestamp,
  type Firestore,
  runTransaction,
  doc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export async function addCapitalEntry(
  db: Firestore,
  userId: string,
  data: any
) {
  if (data.source === 'Store Payout' && data.relatedOrderId) {
    return runPayoutTransaction(db, userId, data.relatedOrderId, data);
  }

  const capitalCollectionRef = collection(db, 'users', userId, 'capital');
  const capitalData = {
    ...data,
    type: data.type, // 'Deposit' or 'Withdrawal'
    createdBy: userId,
    createdAt: serverTimestamp(),
  };

  return addDoc(capitalCollectionRef, capitalData).catch((error) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: capitalCollectionRef.path,
        operation: 'create',
        requestResourceData: capitalData,
      })
    );
    throw error;
  });
}

async function runPayoutTransaction(
  db: Firestore,
  userId: string,
  orderId: string,
  capitalData: any
) {
  const orderRef = doc(db, 'users', userId, 'orders', orderId);
  const capitalCollectionRef = collection(db, 'users', userId, 'capital');

  try {
    await runTransaction(db, async (transaction) => {
      const orderDoc = await transaction.get(orderRef);

      if (!orderDoc.exists()) {
        throw new Error('Order not found.');
      }

      const order = orderDoc.data();
      // Security rule already protects this, but client-side check is good UX
      if (order.createdBy !== userId) {
        throw new FirestorePermissionError({
            path: orderRef.path,
            operation: 'get',
        });
      }
      if (order.payoutStatus !== 'waiting') {
        throw new Error('This order payout has already been processed.');
      }
      
      // 1. Create Capital Record
      const newCapitalRef = doc(capitalCollectionRef);
      transaction.set(newCapitalRef, {
        ...capitalData,
        type: 'Deposit',
        source: 'Store Payout',
        createdBy: userId,
        createdAt: serverTimestamp(),
        currency: 'MAD',
      });
      
      // 2. Update Order Payout Status
      transaction.update(orderRef, {
        payoutStatus: 'received',
        payoutCapitalId: newCapitalRef.id,
      });
    });
    console.log('Payout transaction successful!');
  } catch (e: any) {
    console.error('Payout transaction failed: ', e);
    // Let the global error handler catch permission issues
    if (!(e instanceof FirestorePermissionError)) {
        // Handle other transaction failures (e.g. order not found, already processed)
        // Maybe show a toast to the user
    }
    throw e;
  }
}
