
'use client';

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CapitalEntriesTable, type CapitalEntry } from '@/components/capital/capital-entries-table';

export default function CapitalEntriesPage() {
  const { isUserLoading, user } = useUser();
  const firestore = useFirestore();

  const capitalQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'capital'));
  }, [firestore, user?.uid]);

  const { data: capitalEntries, isLoading: isCapitalLoading } = useCollection<CapitalEntry>(capitalQuery);

  const sortedEntries = useMemo(() => {
    if (!capitalEntries) return [];
    // Firestore Timestamps can be converted to dates
    return [...capitalEntries].sort((a, b) => {
        const dateA = a.createdAt?.toDate?.().getTime() ?? 0;
        const dateB = b.createdAt?.toDate?.().getTime() ?? 0;
        return dateB - dateA;
    });
  }, [capitalEntries]);

  if (isUserLoading || isCapitalLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-body">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading capital entries...</p>
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
            <div className="text-left mb-6">
                <h1 className="text-2xl font-bold text-foreground">Capital Entries</h1>
                <p className="text-muted-foreground mt-1">Latest transactions first</p>
            </div>
            <CapitalEntriesTable data={sortedEntries} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
