// src/components/ui/toast.tsx
"use client";

import * as React from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  return (
    <ToastPrimitives.Provider>
      <ToastPrimitives.Viewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </ToastPrimitives.Provider>
  );
}

interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> {
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
}

export function Toast({ 
  title, 
  description, 
  variant = 'default', 
  ...props 
}: ToastProps) {
  return (
    <ToastPrimitives.Root
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 shadow-lg transition-all',
        {
          'bg-white border-gray-200': variant === 'default',
          'bg-green-50 border-green-200': variant === 'success',
          'bg-red-50 border-red-200': variant === 'error',
        }
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        {title && <ToastPrimitives.Title className="font-semibold">{title}</ToastPrimitives.Title>}
        {description && <ToastPrimitives.Description className="text-sm opacity-90">{description}</ToastPrimitives.Description>}
      </div>
      <ToastPrimitives.Close className="absolute right-1 top-1 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 group-hover:opacity-100">
        <Cross2Icon className="h-4 w-4" />
      </ToastPrimitives.Close>
    </ToastPrimitives.Root>
  );
}