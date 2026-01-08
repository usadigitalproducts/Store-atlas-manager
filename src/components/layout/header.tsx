'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Settings, Home as HomeIcon, Database, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();
  const isHomePage = pathname === '/';
  const isLoginPage = pathname === '/login';
  const isSettingsPage = pathname === '/settings';
  const isCapitalSubPage = pathname.startsWith('/capital/');
  const isOrdersSubPage = pathname.startsWith('/orders/');

  // Determine the back arrow's link
  let backLink = '/';
  if (isCapitalSubPage) {
    backLink = '/capital';
  } else if (isOrdersSubPage) {
    backLink = '/orders';
  } else if (isSettingsPage) {
    backLink = '/';
  }

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };
  
  if (isLoginPage) {
    return (
        <header className={cn(
            "sticky top-0 z-10 flex h-14 items-center border-b bg-card/80 px-4 backdrop-blur-md shadow-sm",
            "justify-center"
        )}>
             <Image src="/medias/logo.png" alt="Atlas Manager Logo" width={100} height={40} className="object-contain" />
        </header>
    );
  }


  return (
    <header className={cn(
        "sticky top-0 z-10 flex h-14 items-center border-b bg-card/80 px-4 backdrop-blur-md shadow-sm",
        "justify-between"
    )}>
      <div className={cn(
        "flex items-center gap-2 justify-start",
      )}>
        {isHomePage ? (
           <Image src="/medias/logo.png" alt="Atlas Manager Logo" width={100} height={40} className="object-contain" />
        ) : (
          <>
            <Button variant="ghost" size="icon" asChild>
              <Link href={backLink}>
                <ArrowLeft className="size-6 text-foreground" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <HomeIcon className="size-5 text-foreground" />
                <span className="sr-only">Home</span>
              </Link>
            </Button>
          </>
        )}
      </div>

      {!isHomePage && (
        <div className="flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
           <Image src="/medias/logo.png" alt="Atlas Manager Logo" width={100} height={40} className="object-contain" />
        </div>
      )}
      
      <div className={cn(
        "flex items-center justify-end gap-3",
      )}>
        <Link href="/seed-data">
            <Button variant="ghost" size="icon">
                <Database className="size-5 text-foreground" />
                <span className="sr-only">Seed Data</span>
            </Button>
        </Link>
        <span className="hidden sm:inline text-sm font-medium text-foreground">
          {user?.displayName ?? user?.email ?? 'User'}
        </span>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="size-5 text-foreground" />
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/settings">
                <DropdownMenuItem>
                    Edit Info
                </DropdownMenuItem>
              </Link>
              <Link href="/settings">
                <DropdownMenuItem>
                    Manage Password
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
               <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </header>
  );
}
