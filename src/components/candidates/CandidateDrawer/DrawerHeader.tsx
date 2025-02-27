"use client"

import React from "react"
import { X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  HoverCard, 
  HoverCardContent, 
  HoverCardTrigger 
} from "@/components/ui/hover-card"

interface DrawerHeaderProps {
  name: string
  onClose: () => void
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({ name, onClose }) => {
  // Determine if name needs to be truncated
  const maxLength = 20
  const isTruncated = name.length > maxLength
  const displayName = isTruncated ? `${name.slice(0, maxLength)}...` : name

  return (
    <div className="sticky top-0 bg-white z-10 border-b">
      <div className="p-6 flex justify-between items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-gray-100 flex-shrink-0"
        >
          <X className="h-6 w-6 text-gray-600" />
        </Button>

        <div className="flex-grow min-w-0">
          <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger className="cursor-default">
              <h2 className="text-2xl font-bold truncate">
                {displayName}
              </h2>
            </HoverCardTrigger>
            <HoverCardContent 
              side="bottom" 
              align="start" 
              className="bg-white shadow-lg border rounded-md p-2 text-sm"
            >
              {name}
            </HoverCardContent>
          </HoverCard>
        </div>

        <Button
          variant="outline"
          className="flex items-center space-x-2 flex-shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>Download PDF</span>
        </Button>
      </div>
    </div>
  )
}

export default DrawerHeader