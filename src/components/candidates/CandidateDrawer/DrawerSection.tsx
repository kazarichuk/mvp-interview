// src/components/candidates/CandidateDrawer/DrawerSection.tsx
"use client"

import React from "react"
import TagList from "./TagList"

interface DrawerSectionProps {
  title: string
  content?: string
  tags?: string[]
  rightContent?: React.ReactNode
}

export const DrawerSection: React.FC<DrawerSectionProps> = ({ 
  title, 
  content, 
  tags, 
  rightContent 
}) => {
  return (
    <div className="p-6 border-b">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {rightContent}
      </div>

      <TagList tags={tags} />

      {content && (
        <p className="text-gray-600">{content}</p>
      )}
    </div>
  )
}

export default DrawerSection