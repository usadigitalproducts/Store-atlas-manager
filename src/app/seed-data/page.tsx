'use client';

import { useState } from 'react';
import { useUser } from '@/firebase';
import { seedDatabaseAction } from '@/app/actions';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function SeedDataPage() {
  const { user, isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSeedDatabase = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to seed the database.',
      });
      return;
    }

    setIsLoading(true);
    const result = await seedDatabaseAction(user.uid);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: result.error,
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Seed Database</CardTitle>
            <CardDescription>Populate your Firestore database with demo data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>For Development Only</AlertTitle>
              <AlertDescription>
                This will add several demo orders and capital entries to your database. It is safe to run multiple times, but it will create duplicate data.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSeedDatabase}
              disabled={isUserLoading || isLoading}
              className="w-full"
            >
              {isLoading ? 'Seeding...' : 'Seed Demo Data'}
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
