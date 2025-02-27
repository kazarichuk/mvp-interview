import { FC } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase/config';
import { logOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { HelpCircle } from 'lucide-react';

interface HeaderProps {
  children?: React.ReactNode;
}

export const Header: FC<HeaderProps> = () => {
  const router = useRouter();
  const userEmail = auth.currentUser?.email;

  const handleLogout = async () => {
    await logOut();
    router.replace('/auth/login');
  };

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and tagline */}
          <div className="flex items-center">
            <div className="text-xl font-semibold">HireFlick</div>
            <div className="ml-3 text-sm text-gray-500">
              The Fastest Way to Find Top Designers & Developers
            </div>
          </div>

          {/* Right side navigation */}
          <div className="flex items-center">
            <Button
              variant="outline"
              asChild
              className="flex items-center mr-2"
            >
              <Link
                href="https://www.linkedin.com/in/konstantin-k-1124791a0/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Support
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="mr-6"
            >
              Log Out
            </Button>
            <div className="text-sm text-gray-500">{userEmail}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;