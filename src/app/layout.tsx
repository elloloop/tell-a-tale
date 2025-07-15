import type { Metadata } from 'next';
import { Inter, Caveat } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Use Inter font for general text
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Use Caveat font for handwritten style
const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
});

export const metadata: Metadata = {
  title: 'Tell A Tale',
  description: 'Share your stories with the world.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tell A Tale',
  },
};

export function generateViewport() {
  return {
    themeColor: '#000000',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable}`}>
      <body className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-grow container mx-auto px-4 py-8">
          <Providers>{children}</Providers>
        </main>
        <footer className="text-center p-4 text-sm text-gray-500">
          © 2025 Tell A Tale. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
