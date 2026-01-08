'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Order } from '@/components/orders/orders-table';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from 'lucide-react';


const formSchema = z.object({
  storeOrderId: z.string().min(1, 'Store Order ID is required.'),
  trackingNumber: z.string().optional(),
  orderDate: z.date({
    required_error: 'An order date is required.',
  }),
  status: z.string().min(1, 'Status is required.'),
  orderPrice: z.preprocess((a) => parseFloat(String(a) || '0'), z.number().min(0)),
  orderCost: z.preprocess((a) => parseFloat(String(a) || '0'), z.number().min(0)),
  shippingCost: z.preprocess((a) => parseFloat(String(a) || '0'), z.number().min(0)),
  additionalFees: z.preprocess((a) => parseFloat(String(a) || '0'), z.number().min(0)),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters.').optional(),
});

type CreateOrderFormProps = {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
  initialData?: Order | null;
};

export function CreateOrderForm({ onSubmit, onCancel, initialData }: CreateOrderFormProps) {
  
  const getInitialValues = () => {
    if (initialData) {
      const orderDate = initialData.orderDate instanceof Date ? initialData.orderDate : initialData.orderDate.toDate();
      return { ...initialData, orderId: initialData.storeOrderId, orderDate };
    }
    return {
      storeOrderId: '',
      trackingNumber: '',
      orderDate: new Date(),
      status: 'Pending',
      orderPrice: 0,
      orderCost: 0,
      shippingCost: 0,
      additionalFees: 0,
      notes: '',
    };
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialValues(),
  });

  React.useEffect(() => {
    form.reset(getInitialValues());
  }, [initialData, form]);

  const notesLength = form.watch('notes')?.length ?? 0;
  const isEditing = !!initialData;
  const isDelivered = initialData?.status === 'Delivered';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {isDelivered && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Order Delivered</AlertTitle>
            <AlertDescription>
              This order is delivered and can no longer be edited.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="storeOrderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Order ID *</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890" {...field} disabled={isEditing} />
                </FormControl>
                <FormDescription>Unique identifier from your store</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trackingNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tracking Number</FormLabel>
                <FormControl>
                  <Input placeholder="Optional tracking number" {...field} disabled={isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="orderDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Order Date *</FormLabel>
                 <Input value={format(field.value, 'MM/dd/yyyy')} disabled />
                 <FormDescription>Date order was placed</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isDelivered}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="orderPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Price (MAD) *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} disabled={isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="orderCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Cost (MAD)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} disabled={isDelivered} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shippingCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shipping Cost (MAD)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} disabled={isDelivered} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additionalFees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Fees (MAD)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} disabled={isDelivered} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional notes about this order..."
                  className="resize-none"
                  {...field}
                  disabled={isDelivered}
                />
              </FormControl>
              <div className="text-xs text-muted-foreground text-right">
                {notesLength}/500
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {!isDelivered && (
            <Button type="submit">{isEditing ? 'Save Changes' : 'Create Order'}</Button>
          )}
        </div>
      </form>
    </Form>
  );
}
