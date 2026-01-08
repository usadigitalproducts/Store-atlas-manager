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
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export type CapitalEntry = {
  id: string;
  createdAt: Timestamp;
  type: 'Deposit' | 'Withdrawal';
  source: string;
  amount: number;
};

type CapitalEntriesTableProps = {
  data: CapitalEntry[];
};

export function CapitalEntriesTable({ data }: CapitalEntriesTableProps) {
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

  const pageCount = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <Card className="shadow-md rounded-2xl">
      <div className="p-4">
        {paginatedData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((entry) => (
                <TableRow key={entry.id}>
                   <TableCell>
                    {format(entry.createdAt.toDate(), 'MM/dd/yyyy')}
                  </TableCell>
                  <TableCell>{entry.type}</TableCell>
                  <TableCell>{entry.source}</TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-semibold',
                      entry.type === 'Deposit' ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {entry.type === 'Deposit' ? '+' : '-'}
                    {`${new Intl.NumberFormat('en-US').format(entry.amount)} MAD`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            No capital entries found.
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
