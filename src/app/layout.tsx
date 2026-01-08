import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { FirebaseClientProvider } from '@/firebase';
import { AdminProvider } from '@/components/providers/admin-provider';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'Atlas Manager',
  description: 'Manage your store with AI-powered insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <FirebaseClientProvider>
          <AdminProvider>
            {children}
          </AdminProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
