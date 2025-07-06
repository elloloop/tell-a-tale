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
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tell A Tale',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable}`}>
      <body className="min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
