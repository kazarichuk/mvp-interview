import { FC } from 'react';
import Link from 'next/link';

interface FooterProps {
  children?: React.ReactNode;
}

export const Footer: FC<FooterProps> = () => {
  return (
    <footer className="bg-gray-50 py-4 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Developed by{' '}
            <a
              href="https://kazarichuk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700"
            >
              kazarichuk.com
            </a>
          </div>
          <div className="flex space-x-6">
            <Link
              href="/terms"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Privacy
            </Link>
            <Link
              href="/faq"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;