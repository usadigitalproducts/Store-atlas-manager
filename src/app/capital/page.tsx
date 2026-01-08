
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useFirebase, useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { StatCard } from '@/components/dashboard/stat-card';
import { ActionButtonCard } from '@/components/dashboard/action-button-card';
import { Wallet, BarChart, Plus, Minus, BookOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddCapitalEntryForm } from '@/components/forms/add-capital-entry-form';
import type { AddCapitalEntryVariant } from '@/components/forms/add-capital-entry-form';
import type { CapitalEntry } from '@/components/capital/capital-entries-table';
import { addCapitalEntry } from '@/firebase/services/capital';
import type { Order } from '@/components/orders/orders-table';

export default function CapitalPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogVariant, setDialogVariant] = useState<AddCapitalEntryVariant>('Deposit');
  
  const { isUserLoading, user } = useUser();
  const firestore = useFirestore();
  
  const capitalQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'capital'));
  }, [firestore, user?.uid]);

  const { data: capitalEntries, isLoading: isCapitalLoading } = useCollection<CapitalEntry>(capitalQuery);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(d);
  }, []);

  const todaysOrdersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
        collection(firestore, 'users', user.uid, 'orders'), 
        where('createdAt', '>=', today)
    );
  }, [firestore, user?.uid, today]);

  const { data: todaysOrders, isLoading: areTodaysOrdersLoading } = useCollection<Order>(todaysOrdersQuery);

  const todaysProfitLoss = useMemo(() => {
    if (!todaysOrders) return 0;
    return todaysOrders.reduce((acc, order) => {
        const profit = order.orderPrice - (order.orderCost || 0) - (order.shippingCost || 0) - (order.additionalFees || 0);
        return acc + profit;
    }, 0);
  }, [todaysOrders]);

  const totalCapital = useMemo(() => {
    if (!capitalEntries) return 0;
    return capitalEntries.reduce((acc, entry) => {
      if (entry.type === 'Deposit') {
        return acc + entry.amount;
      }
      return acc - entry.amount;
    }, 0);
  }, [capitalEntries]);

  const profitLossColor = todaysProfitLoss >= 0 ? 'text-green-600' : 'text-red-600';


  const handleOpenDialog = (variant: AddCapitalEntryVariant) => {
    setDialogVariant(variant);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (!user || !firestore) return;
    
    try {
      await addCapitalEntry(firestore, user.uid, data);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding capital entry:", error);
      // You can use a toast to show the error to the user
    }
  };
  
  if (isUserLoading || isCapitalLoading || areTodaysOrdersLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-body">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 pb-28">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div className="container mx-auto max-w-sm">
            <div className="text-left mb-6">
              <h1 className="text-2xl font-bold text-foreground">Manage Capital</h1>
              <p className="text-muted-foreground mt-1">
                Track, update, and analyze your capital
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Current Capital"
                value={
                  <>
                    {new Intl.NumberFormat('en-US').format(totalCapital)}
                    <span className="text-lg ml-1">MAD</span>
                  </>
                }
                subtitle="Available Balance"
                icon={<Wallet className="size-6 text-muted-foreground" />}
              />
              <StatCard
                title="Today's P/L"
                value={
                  <>
                    {new Intl.NumberFormat('en-US').format(todaysProfitLoss)}
                    <span className="text-lg ml-1">MAD</span>
                  </>
                }
                subtitle="Since Midnight"
                icon={<BarChart className="size-6 text-muted-foreground" />}
                valueClassName={profitLossColor}
              />

              <div className="col-span-1" onClick={() => handleOpenDialog('Deposit')}>
                <DialogTrigger asChild>
                  <ActionButtonCard
                    title="Deposit"
                    icon={<Plus className="size-8 text-green-600" />}
                  />
                </DialogTrigger>
              </div>
              <div className="col-span-1" onClick={() => handleOpenDialog('Withdrawal')}>
                 <DialogTrigger asChild>
                  <ActionButtonCard
                    title="Withdrawal"
                    icon={<Minus className="size-8 text-red-600" />}
                  />
                </DialogTrigger>
              </div>

               <Link href="/capital/entries" className="col-span-2">
                 <div className="bg-card shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-accent">
                    <div>
                        <h3 className="font-semibold text-card-foreground">Capital Entries</h3>
                        <p className="text-sm text-muted-foreground">Latest transactions first</p>
                    </div>
                    <BookOpen className="size-8 text-primary" />
                </div>
              </Link>

            </div>
          </div>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Capital Entry</DialogTitle>
              <DialogDescription>
                Record a new {dialogVariant === 'Deposit' ? 'income' : 'expense'}.
              </DialogDescription>
            </DialogHeader>
            <AddCapitalEntryForm 
              variant={dialogVariant} 
              onSubmit={handleFormSubmit}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
