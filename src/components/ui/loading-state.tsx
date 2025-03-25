// src/components/ui/loading-state.tsx
"use client";

import { cn } from "@/lib/utils";

interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};

export function LoadingState({ size = 'md', text, className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className={cn(
        'border-t-transparent border-4 border-slate-900 rounded-full animate-spin',
        sizeClasses[size]
      )} />
      {text && (
        <p className="mt-2 text-sm text-slate-600">{text}</p>
      )}
    </div>
  );
}