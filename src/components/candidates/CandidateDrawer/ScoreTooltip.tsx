// src/components/candidates/CandidateDrawer/ScoreTooltip.tsx
"use client"

import React from "react"
import { HelpCircle } from "lucide-react"
import { 
  HoverCard, 
  HoverCardContent, 
  HoverCardTrigger 
} from "@/components/ui/hover-card"

export const ScoreTooltip: React.FC = () => (
  <HoverCard openDelay={100} closeDelay={100}>
    <HoverCardTrigger className="cursor-help">
      <HelpCircle className="h-5 w-5 text-gray-500" />
    </HoverCardTrigger>
    <HoverCardContent 
      side="bottom" 
      align="center"
      className="bg-white shadow-lg border rounded-md p-3 text-sm max-w-[260px]"
    >
      <p className="text-gray-700 leading-snug">
        Score represents the depth of knowledge and skills for this level.
        Higher score indicates more comprehensive expertise.
      </p>
    </HoverCardContent>
  </HoverCard>
)

export default ScoreTooltip