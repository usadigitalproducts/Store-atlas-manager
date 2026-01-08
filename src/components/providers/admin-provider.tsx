
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/components/users/users-table';

interface AdminContextType {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isCheckingAdmin: boolean;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  isSuperAdmin: false,
  isCheckingAdmin: true,
});

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const userProfileRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user?.uid, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  const isCheckingAdmin = isUserLoading || isProfileLoading;

  useEffect(() => {
    if (!isCheckingAdmin && userProfile) {
      const isSuper = userProfile.role === 'superadmin' && userProfile.active === true;
      const isAdminUser = (userProfile.role === 'admin' && userProfile.active === true) || isSuper;
      setIsAdmin(isAdminUser);
      setIsSuperAdmin(isSuper);
    } else if (!isCheckingAdmin && !userProfile) {
      // If loading is finished and there's no profile, they are not an admin.
      setIsAdmin(false);
      setIsSuperAdmin(false);
    }
  }, [isCheckingAdmin, userProfile]);

  return (
    <AdminContext.Provider value={{ isAdmin, isSuperAdmin, isCheckingAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
