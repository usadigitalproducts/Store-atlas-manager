'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { StatCard } from '@/components/dashboard/stat-card';
import { ActionButtonCard } from '@/components/dashboard/action-button-card';
import { Wallet, Receipt, BarChart, ShoppingBag, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function Home() {

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
                    0
                    <span className="text-lg ml-1">MAD</span>
                  </>
                }
                subtitle="Current Balance"
                icon={<Wallet className="size-6 text-muted-foreground" />}
              />
              <StatCard
                title="Total Orders"
                value="0"
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
