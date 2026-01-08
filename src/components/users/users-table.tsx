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
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'staff';
  active: boolean;
  createdAt: Date | Timestamp;
};

type UsersTableProps = {
  data: UserProfile[];
  currentUserId?: string | null;
  onEdit: (user: UserProfile) => void;
  onDisable: (user: UserProfile) => void;
};

export function UsersTable({ data, currentUserId, onEdit, onDisable }: UsersTableProps) {

  const getRoleVariant = (role: UserProfile['role']) => {
    if (role === 'superadmin') return 'destructive';
    return role === 'admin' ? 'default' : 'secondary';
  };

  const getStatusVariant = (active: boolean) => {
    return active ? 'outline' : 'destructive';
  };

  return (
    <Card className="shadow-md rounded-2xl">
      <div className="p-4">
        {data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(user.active)}>{user.active ? 'Active' : 'Disabled'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDisable(user)}
                      disabled={user.id === currentUserId} // Can't disable yourself
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            No users found.
          </div>
        )}
      </div>
    </Card>
  );
}
