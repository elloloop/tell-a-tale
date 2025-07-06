import Link from 'next/link';
import RegionSelector from './RegionSelector';

export default function Header() {
  return (
    <header className="w-full bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-handwriting">
            Tell A Tale
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/" className="font-handwriting hover:text-gray-600">
              Home
            </Link>
            <Link href="/stories" className="font-handwriting hover:text-gray-600">
              Stories
            </Link>
            <Link href="/about" className="font-handwriting hover:text-gray-600">
              About
            </Link>
            <RegionSelector />
          </div>
        </div>
      </nav>
    </header>
  );
}
