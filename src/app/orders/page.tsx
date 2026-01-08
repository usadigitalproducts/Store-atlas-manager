
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { StatCard } from '@/components/dashboard/stat-card';
import { ActionButtonCard } from '@/components/dashboard/action-button-card';
import { Package, Truck, PackagePlus, BookOpen, Clock, Banknote } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateOrderForm } from '@/components/forms/create-order-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createOrder } from '@/firebase/services/orders';
import type { Order } from '@/components/orders/orders-table';


export default function OrdersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isUserLoading, user } = useUser();
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'orders'));
  }, [firestore, user?.uid]);

  const { data: orders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);

  const orderStats = useMemo(() => {
    if (!orders) {
      return { pendingOrders: 0, inTransit: 0, payoutWaitingCount: 0, payoutWaitingValue: 0 };
    }
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const inTransit = orders.filter(o => o.status === 'Shipped').length;
    const payoutWaitingCount = orders.filter(o => o.payoutStatus === 'waiting').length;
    const payoutWaitingValue = orders.filter(o => o.payoutStatus === 'waiting').reduce((sum, order) => sum + order.orderPrice, 0);

    return { pendingOrders, inTransit, payoutWaitingCount, payoutWaitingValue };
  }, [orders]);

  const handleFormSubmit = (data: any) => {
    if (!user || !firestore) return;
    console.log('Order form data submitted:', data);
    createOrder(firestore, user.uid, data);
    setIsDialogOpen(false);
  };
  
  if (isUserLoading || areOrdersLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-body">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading order data...</p>
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

              <div className="col-span-1">
                <DialogTrigger asChild>
                  <div onClick={() => setIsDialogOpen(true)} className="h-full">
                     <ActionButtonCard
                        title="Create New Order"
                        icon={<PackagePlus className="size-8 text-primary" />}
                      />
                  </div>
                </DialogTrigger>
              </div>
              <Link href="/orders/entries" className="col-span-1">
                 <ActionButtonCard
                    title="Manage Orders"
                    icon={<BookOpen className="size-8 text-primary" />}
                  />
              </Link>
            </div>
          </div>
          <DialogContent className="sm:max-w-3xl h-screen">
            <ScrollArea className="h-full">
              <div className="p-6 pt-0">
                <DialogHeader>
                  <DialogTitle>Add New Order</DialogTitle>
                  <DialogDescription>
                    Create a new order from your store or manual entry.
                  </DialogDescription>
                </DialogHeader>
                <CreateOrderForm 
                  onSubmit={handleFormSubmit}
                  onCancel={() => setIsDialogOpen(false)}
                />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
