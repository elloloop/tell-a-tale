import Link from 'next/link';
import { BookOpenText, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppHeader() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          Tell-a-Tale
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/stories" className="flex items-center gap-2">
              <BookOpenText className="h-5 w-5" />
              <span className="hidden sm:inline">My Stories</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
