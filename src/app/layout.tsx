import type { Metadata } from 'next';
import './globals.css';
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { RootProviders } from '@/components/providers/root-providers';

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
        <RootProviders>
          {children}
        </RootProviders>
      </body>
    </html>
  );
}
