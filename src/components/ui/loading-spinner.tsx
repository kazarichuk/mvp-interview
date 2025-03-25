// src/components/ui/loading-spinner.tsx
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
};

export function LoadingSpinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center w-full h-[calc(100vh-4rem)]">
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]} ${className || ''}`}></div>
    </div>
  );
}