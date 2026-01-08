'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { UpdateProfileForm } from '@/components/forms/update-profile-form';
import { UpdatePasswordForm } from '@/components/forms/update-password-form';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { updateUser, updateUserPassword } from '@/firebase/services/users';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const handleUpdateProfile = async (data: { name: string }) => {
    if (!user || !firestore) return;
    try {
      await updateUser({ firestore, userId: user.uid, name: data.name });
      toast({
        title: 'Success!',
        description: 'Your profile has been updated.',
      });
    } catch (error) {
      console.error('Failed to update profile', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: (error as Error).message || 'Could not update your profile.',
      });
    }
  };

  const handleUpdatePassword = async (data: { currentPassword?: string; newPassword?: string; }) => {
     if (!user || !auth) return;
    try {
      await updateUserPassword({
          auth: auth,
          currentPassword: data.currentPassword!,
          newPassword: data.newPassword!
      });
      toast({
        title: 'Success!',
        description: 'Your password has been changed.',
      });
    } catch (error) {
      console.error('Failed to update password', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: (error as Error).message || 'Could not update your password.',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 pb-28">
        <div className="container mx-auto max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account and password settings.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Update Profile</CardTitle>
                    <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UpdateProfileForm
                        initialData={{ name: user?.displayName ?? '' }}
                        onSubmit={handleUpdateProfile}
                    />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                       Ensure your account is secure by using a strong, unique password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UpdatePasswordForm
                        onSubmit={handleUpdatePassword}
                    />
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
