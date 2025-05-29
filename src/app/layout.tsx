import type { Metadata } from 'next';
import { Indie_Flower } from 'next/font/google'; // Changed from Patrick_Hand
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import { UserProvider } from '@/providers/user-provider';

// Instantiate Indie Flower font
const indieFlower = Indie_Flower({
  variable: '--font-indie-flower', // New CSS variable
  subsets: ['latin'],
  weight: ['400'], // Indie Flower also has 400 weight
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
    // Apply the font variable to html tag
    <html lang="en" className={`${indieFlower.variable} h-full`}>
      {/* Apply the font class directly to the body for global effect */}
      <body className={`${indieFlower.className} antialiased flex flex-col min-h-screen`}>
        <UserProvider>
          <AppHeader />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <AppFooter />
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
