
'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { StatCard } from '@/components/dashboard/stat-card';
import { Wallet, BarChart, BookOpen } from 'lucide-react';

export default function CapitalPage() {
  const totalCapital = 0;
  const todaysProfitLoss = 0;
  const profitLossColor = 'text-green-600';


  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 pb-28">
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
      </main>
      <Footer />
    </div>
  );
}
