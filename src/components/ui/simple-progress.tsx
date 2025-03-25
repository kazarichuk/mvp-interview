"use client"

import React from "react"

interface SimpleProgressProps {
  value?: number;
  className?: string;
}

export function SimpleProgress({ value = 0, className = "" }: SimpleProgressProps) {
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <div 
        className="h-full bg-blue-500 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}