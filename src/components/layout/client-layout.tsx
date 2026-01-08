'use client';

import { RootProviders } from '@/components/providers/root-providers';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootProviders>
      <FirebaseErrorListener />
      {children}
    </RootProviders>
  );
}
