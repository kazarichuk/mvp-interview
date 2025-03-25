// src/components/candidates/CandidateDrawer/TagList.tsx
"use client"

import React from "react"

interface TagListProps {
  tags?: string[]
}

export const TagList: React.FC<TagListProps> = ({ tags }) => {
  if (!tags || tags.length === 0) return null
  
  return (
    <div className="flex items-center space-x-2 mb-3">
      {tags.map((tag, index) => (
        <div
          key={index}
          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs inline-block"
        >
          {tag}
        </div>
      ))}
    </div>
  )
}

export default TagList