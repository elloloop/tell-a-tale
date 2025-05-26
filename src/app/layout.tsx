import type { Metadata } from 'next';
import { Patrick_Hand } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';

const patrickHand = Patrick_Hand({
  variable: '--font-patrick-hand', // We'll keep the variable for direct use if needed
  subsets: ['latin'],
  weight: ['400'], // Patrick Hand only has 400 weight
});

export const metadata: Metadata = {
  title: 'Tell-a-Tale: Daily Story Adventures',
  description: 'Craft unique stories inspired by daily images and AI prompts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      {/* Apply the font class directly to the body for global effect */}
      <body className={`${patrickHand.className} antialiased flex flex-col min-h-screen`}>
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <AppFooter />
        <Toaster />
      </body>
    </html>
  );
}
