
'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { StatCard } from '@/components/dashboard/stat-card';
import { Package, Truck, BookOpen, Clock, Banknote } from 'lucide-react';

export default function OrdersPage() {
  const orderStats = {
    pendingOrders: 0,
    inTransit: 0,
    payoutWaitingCount: 0,
    payoutWaitingValue: 0
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 pb-28">
        <div className="container mx-auto max-w-sm">
          <div className="text-left mb-6">
            <h1 className="text-2xl font-bold text-foreground">Manage Orders</h1>
            <p className="text-muted-foreground mt-1">
              Track fulfillment and manage your orders
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Pending"
              value={orderStats.pendingOrders.toString()}
              subtitle="Orders to fulfill"
              icon={<Package className="size-6 text-muted-foreground" />}
            />
            <StatCard
              title="In Transit"
              value={orderStats.inTransit.toString()}
              subtitle="Shipped orders"
              icon={<Truck className="size-6 text-muted-foreground" />}
            />
            <StatCard
              title="Payout Waiting"
              value={orderStats.payoutWaitingCount.toString()}
              subtitle="Orders"
              icon={<Clock className="size-6 text-muted-foreground" />}
            />
            <StatCard
              title="Payout Waiting"
              value={
                <>
                  {new Intl.NumberFormat('en-US').format(orderStats.payoutWaitingValue)}
                  <span className="text-lg ml-1">MAD</span>
                </>
              }
              subtitle="Total Value"
              icon={<Banknote className="size-6 text-muted-foreground" />}
            />

            <Link href="/orders/entries" className="col-span-2">
              <div className="bg-card shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-accent">
                <div>
                  <h3 className="font-semibold text-card-foreground">View All Orders</h3>
                  <p className="text-sm text-muted-foreground">Manage order details</p>
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
