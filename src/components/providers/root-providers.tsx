'use client';

import { FirebaseClientProvider } from '@/firebase';
import { AdminProvider } from '@/components/providers/admin-provider';
import { Toaster } from "@/components/ui/toaster";

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <AdminProvider>
        {children}
        <Toaster />
      </AdminProvider>
    </FirebaseClientProvider>
  );
}
