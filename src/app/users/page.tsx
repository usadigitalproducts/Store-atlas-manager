
'use client';

import { useState, useMemo, useEffect } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { UsersTable, type UserProfile } from '@/components/users/users-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UserForm } from '@/components/forms/user-form';
import { createUser, updateUser, disableUser } from '@/app/actions';
import { useAdmin } from '@/components/providers/admin-provider';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const { isUserLoading, user } = useUser();
  const { isSuperAdmin, isCheckingAdmin } = useAdmin();
  const firestore = useFirestore();
  const router = useRouter();

  // Redirect non-superadmins
  useEffect(() => {
    if (!isCheckingAdmin && !isSuperAdmin) {
      router.replace('/');
    }
  }, [isSuperAdmin, isCheckingAdmin, router]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isSuperAdmin) return null;
    return query(collection(firestore, 'users'), orderBy('createdAt', 'desc'));
  }, [firestore, isSuperAdmin]);

  const { data: users, isLoading: areUsersLoading } = useCollection<UserProfile>(usersQuery);

  const handleCreateNew = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDisable = async (userProfile: UserProfile) => {
    if (window.confirm(`Are you sure you want to disable user ${userProfile.name}?`)) {
      try {
        await disableUser({ userId: userProfile.id });
      } catch (error) {
        console.error("Failed to disable user:", error);
        alert('Failed to disable user.');
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedUser) {
        await updateUser({ userId: selectedUser.id, ...data });
      } else {
        await createUser(data);
      }
      setIsDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to save user:", error);
      alert(`Failed to save user: ${(error as Error).message}`);
    }
  };
  
  const isLoading = isUserLoading || areUsersLoading || isCheckingAdmin;
  
  if (isLoading || !isSuperAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-body">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading user data...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 pb-32">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div className="text-left">
              <h1 className="text-2xl font-bold text-foreground">Manage Users</h1>
              <p className="text-muted-foreground mt-1">Create, edit, and manage user accounts.</p>
            </div>
            <Button onClick={handleCreateNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </div>
          <UsersTable 
            data={users || []} 
            currentUserId={user?.uid}
            onEdit={handleEdit}
            onDisable={handleDisable}
          />
        </div>
      </main>
      <Footer />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Create New User'}</DialogTitle>
            <DialogDescription>
              {selectedUser ? `Update details for ${selectedUser.name}.` : 'Fill in the form to create a new user.'}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            initialData={selectedUser}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
