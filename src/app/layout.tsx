import type { Metadata } from 'next';
import { Patrick_Hand } from 'next/font/google'; // Changed font
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';

const patrickHand = Patrick_Hand({ // Changed font
  variable: '--font-patrick-hand', // Changed font variable
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
      <body className={`${patrickHand.variable} antialiased flex flex-col min-h-screen`}> {/* Updated font variable */}
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
