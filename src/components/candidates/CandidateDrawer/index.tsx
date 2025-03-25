// src/components/candidates/CandidateDrawer/index.tsx
"use client"

import React, { useEffect, useRef } from "react"
import DrawerHeader from "./DrawerHeader"
import DrawerSection from "./DrawerSection"
import ScoreTooltip from "./ScoreTooltip"

interface CandidateDrawerProps {
  isOpen: boolean
  onClose: () => void
  candidate?: {
    name: string
    level: string
    score: number
    overview?: string
    hardSkills?: string[]
    softSkills?: string[]
    weaknesses?: string[]
    videoUrl?: string
  }
}

export const CandidateDrawer: React.FC<CandidateDrawerProps> = ({
  isOpen,
  onClose,
  candidate
}) => {
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current && 
        !drawerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    // Only add listener if drawer is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  // Render nothing if no candidate is selected
  if (!candidate) return null

  return (
    <div
      ref={drawerRef}
      className={`
        fixed
        top-0
        right-0
        h-full
        w-[500px]
        bg-white
        shadow-lg
        transition-all
        duration-300
        ease-in-out
        overflow-y-auto
        z-50
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {/* Header */}
      <DrawerHeader 
        name={candidate.name}
        onClose={onClose}
      />

      {/* Scrollable Content */}
      <div className="overflow-y-auto">
        {/* Candidate Level and Score */}
        <DrawerSection 
          title={candidate.level}
          rightContent={
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">Score: {candidate.score}/100</span>
              <ScoreTooltip />
            </div>
          }
        />

        {/* Video Placeholder */}
        <div className="p-6 border-b">
          <div className="bg-gray-100 h-64 flex items-center justify-center rounded-lg">
            <span className="text-gray-500">Candidate Interview Video</span>
          </div>
        </div>

        {/* Overview */}
        <DrawerSection 
          title="Overview"
          content={candidate.overview || "We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently."}
        />

        {/* Hard Skills */}
        <DrawerSection 
          title="Hard Skills"
          content={candidate.hardSkills?.[0] || "We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently."}
          tags={["UI/UX", "Figma", "Prototyping"]}
        />

        {/* Soft Skills */}
        <DrawerSection 
          title="Soft Skills"
          content={candidate.softSkills?.[0] || "We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently."}
          tags={["Communication", "Teamwork", "Problem Solving"]}
        />

        {/* Weaknesses */}
        <DrawerSection 
          title="Weaknesses"
          content={candidate.weaknesses?.[0] || "We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently."}
          tags={["Time Management", "Presentation Skills"]}
        />
      </div>
    </div>
  )
}

export default CandidateDrawer