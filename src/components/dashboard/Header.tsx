"use client";

import { FC, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  LogOut, 
  User, 
  ChevronDown, 
  Settings, 
  Bell,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import LogoutConfirmation from "@/components/auth/LogoutConfirmation";

interface HeaderProps {
  children?: React.ReactNode;
}

export const Header: FC<HeaderProps> = () => {
  const router = useRouter();
  const userEmail = auth.currentUser?.email;
  const userName = auth.currentUser?.displayName || userEmail?.split('@')[0] || 'User';
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and tagline */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <div className="relative h-8 w-8 mr-2">
                <Image src="/android-chrome-512x512.png" alt="HireFlick Logo" width={32} height={32} />
              </div>
              <div className="text-xl font-bold text-gray-800">HireFlick</div>
            </Link>
            <div className="hidden md:block ml-3 text-sm text-muted-foreground">
              AI-Powered Talent Assessment
            </div>
          </div>

          {/* Right side navigation */}
          <div className="flex items-center space-x-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Bell className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="text-muted-foreground"
                  >
                    <Link
                      href="https://www.linkedin.com/in/konstantin-k-1124791a0/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Support Chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="hidden md:flex items-center border-l border-border h-8 mx-2"></div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-1 h-9" aria-label="User menu">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-medium overflow-hidden">
                    {getInitials(userName)}
                  </div>
                  <span className="text-sm font-medium hidden md:inline-block max-w-[120px] truncate">{userName}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs text-muted-foreground leading-none">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="opacity-60">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                    <Badge variant="outline" className="ml-auto text-xs">Free</Badge>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <LogoutConfirmation />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;