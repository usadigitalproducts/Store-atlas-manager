'use client';

import { useMemo, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { StatCard } from '@/components/dashboard/stat-card';
import { ActionButtonCard } from '@/components/dashboard/action-button-card';
import { Wallet, Receipt, BarChart, ShoppingBag, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';
import { collection, query } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import type { Order } from '@/components/orders/orders-table';
import type { CapitalEntry } from '@/components/capital/capital-entries-table';
import { useAdmin } from '@/components/providers/admin-provider';
import { useRouter } from 'next/navigation';


export default function Home() {

  const { isUserLoading, user } = useUser();
  const firestore = useFirestore();
  const { isAdmin, isSuperAdmin } = useAdmin();
  const router = useRouter();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'orders'));
  }, [firestore, user?.uid]);

  const capitalQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'capital'));
  }, [firestore, user?.uid]);

  const { data: orders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);
  const { data: capitalEntries, isLoading: isCapitalLoading } = useCollection<CapitalEntry>(capitalQuery);

  const totalCapital = useMemo(() => {
    if (!capitalEntries) return 0;
    return capitalEntries.reduce((acc, entry) => {
      if (entry.type === 'Deposit') {
        return acc + entry.amount;
      }
      return acc - entry.amount;
    }, 0);
  }, [capitalEntries]);

  const totalOrders = useMemo(() => orders?.length ?? 0, [orders]);
  
  const isLoading = isUserLoading || areOrdersLoading || isCapitalLoading;

  if (isLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-body">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading dashboard...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 pb-40">
        <div className="container mx-auto max-w-sm">
          <div className="text-left mb-6">
            <h1 className="text-2xl font-bold text-foreground">Atlas Manager</h1>
            <p className="text-muted-foreground mt-1">
              Here you can monitor your store performance and manage your capital
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <StatCard
                title="Capital"
                value={
                  <>
                    {new Intl.NumberFormat('en-US').format(totalCapital)}
                    <span className="text-lg ml-1">MAD</span>
                  </>
                }
                subtitle="Current Balance"
                icon={<Wallet className="size-6 text-muted-foreground" />}
              />
              <StatCard
                title="Total Orders"
                value={totalOrders.toString()}
                subtitle="All Time"
                icon={<Receipt className="size-6 text-muted-foreground" />}
              />
            <Link href="/capital" className="h-[135px]">
              <ActionButtonCard
                title="Manage Capital"
                icon={<BarChart className="size-8 text-primary" />}
              />
            </Link>
            <Link href="/orders" className="h-[135px]">
              <ActionButtonCard
                title="Manage Orders"
                icon={<ShoppingBag className="size-8 text-primary" />}
              />
            </Link>

            {isSuperAdmin && (
              <Link href="/users" className="h-[135px]">
                <ActionButtonCard
                  title="Manage Users"
                  icon={<Users className="size-8 text-primary" />}
                />
              </Link>
            )}
            
            <Link href="/capital/entries" className="h-[135px]">
                 <div className="bg-card shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent h-full">
                    <BookOpen className="size-8 text-primary mb-2" />
                    <div>
                        <h3 className="font-semibold text-card-foreground text-sm">Capital Entries</h3>
                        <p className="text-xs text-muted-foreground">View all transactions</p>
                    </div>
                </div>
            </Link>
            <Link href="/orders/entries" className="h-[135px]">
                 <div className="bg-card shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent h-full">
                    <ShoppingBag className="size-8 text-primary mb-2" />
                    <div>
                        <h3 className="font-semibold text-card-foreground text-sm">Orders report</h3>
                        <p className="text-xs text-muted-foreground">Edit costs and status</p>
                    </div>
                </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
