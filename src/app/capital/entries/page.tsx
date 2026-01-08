
'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function CapitalEntriesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 pb-28">
        <div className="container mx-auto max-w-4xl">
          <div className="text-left mb-6">
            <h1 className="text-2xl font-bold text-foreground">Capital Entries</h1>
            <p className="text-muted-foreground mt-1">
              View all your capital transactions
            </p>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-md">
            <p className="text-muted-foreground text-center">No capital entries yet</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
