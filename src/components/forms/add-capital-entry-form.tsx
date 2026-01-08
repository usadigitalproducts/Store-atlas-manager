
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Order } from '@/components/orders/orders-table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';


const formSchema = z.object({
  source: z.string().min(1, 'Source is required.'),
  createdAt: z.date({
    required_error: 'A transaction date is required.',
  }),
  amount: z.preprocess(
    (a) => parseFloat(String(a)),
    z.number().positive('Amount must be positive.')
  ),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters.').optional(),
  relatedOrderId: z.string().optional(),
});

const sourceOptions = {
  Deposit: [
    { value: 'Store Payout', label: 'Store Payout' },
    { value: 'Deposit Investment', label: 'Deposit Investment' },
    { value: 'Loan', label: 'Loan' },
  ],
  Withdrawal: [
    { value: 'Withdrawal', label: 'Withdrawal' },
    { value: 'Investment', label: 'Investment' },
  ],
};


export type AddCapitalEntryVariant = 'Deposit' | 'Withdrawal';

type AddCapitalEntryFormProps = {
  variant?: AddCapitalEntryVariant;
  onSubmit: (data: z.infer<typeof formSchema> & { type: AddCapitalEntryVariant }) => void;
  onCancel: () => void;
};

export function AddCapitalEntryForm({ variant = 'Deposit', onSubmit, onCancel }: AddCapitalEntryFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      source: sourceOptions[variant][0].value,
      createdAt: new Date(),
      amount: 0,
      notes: '',
      relatedOrderId: undefined,
    },
  });

  const [orderSelectorOpen, setOrderSelectorOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || form.watch('source') !== 'Store Payout') return null;
    return query(
      collection(firestore, 'users', user.uid, 'orders'),
      where('payoutStatus', '==', 'waiting')
    );
  }, [firestore, user?.uid, form.watch('source')]);

  const { data: waitingOrders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);

  React.useEffect(() => {
    form.reset({
      source: sourceOptions[variant][0].value,
      createdAt: new Date(),
      amount: 0,
      notes: '',
      relatedOrderId: undefined,
    });
    setSelectedOrder(null);
  }, [variant, form]);

  const notesLength = form.watch('notes')?.length ?? 0;
  const currentSourceOptions = sourceOptions[variant];
  const selectedSource = form.watch('source');
  
  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit({ ...data, type: variant });
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    form.setValue('relatedOrderId', order.id);
    form.setValue('amount', order.orderPrice);
    setOrderSelectorOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
        
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source *</FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value);
                setSelectedOrder(null);
                form.setValue('relatedOrderId', undefined);
                form.setValue('amount', 0);
              }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currentSourceOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedSource === 'Store Payout' && (
          <FormItem>
            <FormLabel>Order *</FormLabel>
             <Popover open={orderSelectorOpen} onOpenChange={setOrderSelectorOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !selectedOrder && "text-muted-foreground"
                      )}
                    >
                      {selectedOrder
                        ? `Order #${selectedOrder.storeOrderId}`
                        : "Select an order"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search orders..." />
                    <CommandEmpty>{isLoadingOrders ? 'Loading...' : 'No pending orders found.'}</CommandEmpty>
                    <CommandGroup>
                      {waitingOrders?.map((order) => (
                        <CommandItem
                          value={order.storeOrderId}
                          key={order.id}
                          onSelect={() => handleOrderSelect(order)}
                        >
                          Order #{order.storeOrderId} ({new Intl.NumberFormat('en-US').format(order.orderPrice)} MAD)
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            <FormMessage />
          </FormItem>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="createdAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Transaction Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'MM/dd/yyyy')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Amount (MAD) *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} readOnly={selectedSource === 'Store Payout'}/>
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
                  placeholder="Add an optional note..."
                  className="resize-none"
                  {...field}
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
          <Button type="submit">Create Entry</Button>
        </div>
      </form>
    </Form>
  );
}
