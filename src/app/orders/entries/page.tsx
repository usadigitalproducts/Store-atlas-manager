
'use client';

import { useState, useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { OrdersTable, type Order } from '@/components/orders/orders-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CreateOrderForm } from '@/components/forms/create-order-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { updateOrder } from '@/firebase/services/orders';

export default function OrderEntriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { isUserLoading, user } = useUser();
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'orders'));
  }, [firestore, user?.uid]);

  const { data: orders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);

  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return orders.sort((a, b) => {
        const dateA = a.orderDate instanceof Date ? a.orderDate.getTime() : a.orderDate.toDate().getTime();
        const dateB = b.orderDate instanceof Date ? b.orderDate.getTime() : b.orderDate.toDate().getTime();
        return dateB - dateA;
    });
  }, [orders]);


  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (!user || !firestore || !selectedOrder) return;
    updateOrder(firestore, user.uid, selectedOrder.id, data);
    setIsDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedOrder(null);
  }

  if (isUserLoading || areOrdersLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-body">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading orders...</p>
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
                <h1 className="text-2xl font-bold text-foreground">Manage Orders</h1>
                <p className="text-muted-foreground mt-1">Latest orders first</p>
            </div>
            <OrdersTable data={sortedOrders} onRowClick={handleRowClick} />
        </div>
      </main>
      <Footer />
       <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-3xl h-screen">
            <ScrollArea className="h-full">
              <div className="p-6 pt-0">
                <DialogHeader>
                  <DialogTitle>Edit Order</DialogTitle>
                  <DialogDescription>
                    Update the details for order #{selectedOrder?.storeOrderId}.
                  </DialogDescription>
                </DialogHeader>
                <CreateOrderForm 
                  onSubmit={handleFormSubmit}
                  onCancel={handleDialogClose}
                  initialData={selectedOrder}
                />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
    </div>
  );
}
