'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export type Order = {
  id: string;
  storeOrderId: string;
  orderDate: Date | Timestamp;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Canceled';
  payoutStatus: 'received' | 'waiting';
  orderPrice: number;
  orderCost: number;
  shippingCost: number;
  additionalFees: number;
  notes?: string;
};

type OrdersTableProps = {
  data: Order[];
  onRowClick?: (order: Order) => void;
};

export function OrdersTable({ data, onRowClick }: OrdersTableProps) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(parseInt(value, 10));
    setPage(0);
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, pageCount - 1));
  };

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'Shipped':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Delivered':
        return 'outline';
      case 'Canceled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getPayoutStatusVariant = (status: Order['payoutStatus']) => {
    switch (status) {
      case 'received':
        return 'default';
      case 'waiting':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const pageCount = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <Card className="shadow-md rounded-2xl">
      <div className="p-4">
        {paginatedData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[50px] text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((order) => (
                <TableRow key={order.id} onClick={() => onRowClick?.(order)} className={cn(onRowClick && 'cursor-pointer')}>
                  <TableCell className="font-medium">{order.storeOrderId}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPayoutStatusVariant(order.payoutStatus)}>{order.payoutStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {`${new Intl.NumberFormat('en-US').format(order.orderPrice)} MAD`}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            No orders found.
          </div>
        )}
      </div>
      {data.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={handleRowsPerPageChange}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {pageCount}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousPage}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={page >= pageCount - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
