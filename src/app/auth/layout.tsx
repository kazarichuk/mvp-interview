import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow flex flex-col justify-center py-4 sm:px-6 lg:px-12">
        <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-center mb-6">
          <Image 
            src="/logo.svg" 
            alt="HireFlick Logo" 
            width={120} 
            height={40} 
            className="object-contain"
          />
        </div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {children}
        </div>
      </div>

      <footer className="py-4 text-center text-sm text-gray-600 bg-gray-100">
        <div className="mb-2">
          <Link href="/terms" className="hover:text-gray-900 mx-2">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-gray-900 mx-2">
            Privacy
          </Link>
          <Link href="/faq" className="hover:text-gray-900 mx-2">
            Help Center
          </Link>
        </div>
        <div className="text-xs text-gray-500">
          Developed by <a 
            href="https://kazarichuk.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-gray-700 underline"
          >
            kazarichuk.com
          </a>
        </div>
      </footer>
    </div>
  );
}