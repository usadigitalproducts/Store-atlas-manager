'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isCapitalSubPage = pathname.startsWith('/capital/');
  const isOrdersSubPage = pathname.startsWith('/orders/');

  let backLink = '/';
  if (isCapitalSubPage) {
    backLink = '/capital';
  } else if (isOrdersSubPage) {
    backLink = '/orders';
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
    </header>
  );
}
