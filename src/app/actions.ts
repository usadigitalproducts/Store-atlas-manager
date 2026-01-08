'use server';

import { generateFinancialSummary } from '@/ai/flows/generate-financial-summary';
import type { GenerateFinancialSummaryInput } from '@/ai/flows/generate-financial-summary';
import { getFirestore as getAdminFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/firebase/admin-config';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import type { App } from 'firebase-admin/app';

// --- Lazy Initialization for Firebase Admin ---
let adminApp: App | undefined;
function getAdminApp() {
  if (adminApp) {
    return adminApp;
  }
  try {
    adminApp = initializeAdminApp();
    return adminApp;
  } catch (e: any) {
    console.warn("Firebase Admin SDK not initialized. Server-side admin features will not work.", e.message);
    return undefined;
  }
}


export async function getFinancialSummaryAction(
  input: GenerateFinancialSummaryInput
) {
  try {
    const result = await generateFinancialSummary(input);
    return { success: true, summary: result.summary };
  } catch (error) {
    console.error('Error generating financial summary:', error);
    return { success: false, error: 'Failed to generate summary. Please try again.' };
  }
}

export async function seedDatabaseAction(userId: string) {
    const app = getAdminApp();
    if (!app) {
        return { success: false, error: 'Firebase Admin SDK is not configured on the server.' };
    }
    const db = getAdminFirestore(app);

    if (!userId) {
        return { success: false, error: 'User not authenticated' };
    }

    const batch = db.batch();

    // Demo Orders
    const ordersData = [
        { storeOrderId: 'ATLAS-001', orderDate: new Date('2024-05-20'), orderPrice: 350, orderCost: 150, shippingCost: 30, status: 'Delivered', payoutStatus: 'waiting' },
        { storeOrderId: 'ATLAS-002', orderDate: new Date('2024-05-21'), orderPrice: 420, orderCost: 200, shippingCost: 35, status: 'Shipped', payoutStatus: 'waiting' },
        { storeOrderId: 'ATLAS-003', orderDate: new Date('2024-05-22'), orderPrice: 150, orderCost: 70, shippingCost: 25, status: 'Pending', payoutStatus: 'waiting' },
        { storeOrderId: 'ATLAS-004', orderDate: new Date(), orderPrice: 800, orderCost: 450, shippingCost: 40, status: 'Pending', payoutStatus: 'waiting' },
    ];

    ordersData.forEach(order => {
        const orderRef = db.collection('users').doc(userId).collection('orders').doc();
        batch.set(orderRef, {
            ...order,
            createdBy: userId,
            createdAt: Timestamp.fromDate(order.orderDate),
            payoutCapitalId: null,
            additionalFees: 0,
            notes: '',
        });
    });

    // Demo Capital Entries
    const capitalData = [
        { type: 'Deposit', source: 'Personal Investment', amount: 5000, createdAt: new Date('2024-05-01') },
        { type: 'Withdrawal', source: 'Other', amount: 300, createdAt: new Date('2024-05-15'), note: 'Office supplies' },
    ];

    capitalData.forEach(capital => {
        const capitalRef = db.collection('users').doc(userId).collection('capital').doc();
        batch.set(capitalRef, {
            ...capital,
            createdBy: userId,
            createdAt: Timestamp.fromDate(capital.createdAt),
        });
    });

    try {
        await batch.commit();
        return { success: true, message: 'Database seeded successfully!' };
    } catch (error) {
        console.error('Error seeding database:', error);
        return { success: false, error: 'Failed to seed database.' };
    }
}


// --- User Management Server Actions ---

interface CreateUserPayload {
    name: string;
    email: string;
    role: 'admin' | 'staff' | 'superadmin';
    password?: string;
}

export async function createUser(payload: CreateUserPayload) {
  const app = getAdminApp();
  if (!app) throw new Error("Admin SDK not available.");
  const auth = getAdminAuth(app);
  const db = getAdminFirestore(app);

  const { email, password, name, role } = payload;
  
  if (!password) {
    throw new Error('Password is required to create a user.');
  }

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: true,
    });

    const userProfile = {
      name,
      email,
      role,
      active: true,
      createdAt: Timestamp.now(),
    };
    await db.collection('users').doc(userRecord.uid).set(userProfile);

    return { uid: userRecord.uid, ...userProfile };
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw new Error(error.message || 'Failed to create user.');
  }
}

interface UpdateUserAdminPayload {
    userId: string;
    name?: string;
    role?: 'admin' | 'staff' | 'superadmin';
}


export async function updateUser(payload: UpdateUserAdminPayload) {
    const app = getAdminApp();
    if (!app) throw new Error("Admin SDK not available.");
    const db = getAdminFirestore(app);
    const { userId, ...updateData } = payload;
    
    if (Object.keys(updateData).length === 0) {
        return { success: true, message: 'No changes provided.' };
    }

    try {
        const userRef = db.collection('users').doc(userId);
        await userRef.update(updateData);
        return { success: true };
    } catch (error: any) {
        console.error('Error updating user from admin:', error);
        throw new Error(error.message || 'Failed to update user.');
    }
}


export async function disableUser({ userId }: { userId: string }) {
  const app = getAdminApp();
  if (!app) throw new Error("Admin SDK not available.");
  const auth = getAdminAuth(app);
  const db = getAdminFirestore(app);
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({ active: false });

    await auth.updateUser(userId, { disabled: true });

    return { success: true };
  } catch (error: any) {
    console.error('Error disabling user:', error);
    throw new Error(error.message || 'Failed to disable user.');
  }
}
