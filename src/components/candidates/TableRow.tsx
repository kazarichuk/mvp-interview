// src/components/candidates/TableRow.tsx
"use client"

import React from 'react'
import { FileText } from 'lucide-react'
import { Candidate } from './CandidatesTable'
import { 
  HoverCard, 
  HoverCardContent, 
  HoverCardTrigger 
} from "@/components/ui/hover-card"

interface TableRowProps {
  candidate: Candidate & { 
    level?: string 
    score?: number 
  }
  onDelete: (id: string) => void
  onShowResults: () => void
}

export const TableRow: React.FC<TableRowProps> = ({ 
  candidate, 
  onDelete, 
  onShowResults
}) => {
  // Truncate long names with hover card
  const TruncatedName: React.FC = () => {
    const maxLength = 10
    if (candidate.name.length <= maxLength) {
      return <>{candidate.name}</>
    }

    return (
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger className="cursor-default">
          <span>{`${candidate.name.slice(0, maxLength)}...`}</span>
        </HoverCardTrigger>
        <HoverCardContent 
          side="right" 
          align="start" 
          className="bg-white shadow-lg border rounded-md p-2 text-sm"
        >
          {candidate.name}
        </HoverCardContent>
      </HoverCard>
    )
  }

  // Determine status classes and text
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200'
      case 'pending':
        return 'bg-yellow-50 text-yellow-800 border border-yellow-200'
      case 'failed':
        return 'bg-red-50 text-red-600 border border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'pending':
        return 'Pending'
      case 'failed':
        return 'Failed'
      default:
        return 'Unknown'
    }
  }

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500'
    ]

    const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
    const colorIndex = charCodeSum % colors.length

    return colors[colorIndex]
  }

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div 
            className={`h-10 w-10 rounded-full flex-shrink-0 mr-3 flex items-center justify-center text-white font-medium ${getAvatarColor(candidate.name)}`}
          >
            {getInitials(candidate.name)}
          </div>
          <div className="font-medium text-gray-900">
            <TruncatedName />
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-600">{candidate.email}</div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        {candidate.cv ? (
          <a
            href={candidate.cv.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FileText className="h-4 w-4 mr-1" />
            {candidate.cv.filename}
          </a>
        ) : (
          <span className="text-gray-400">No CV</span>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-600">{candidate.level || 'N/A'}</div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-600">{candidate.score !== undefined ? `${candidate.score}/100` : 'N/A'}</div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <span 
          className={`px-3 py-1 text-xs rounded-md ${getStatusClasses(candidate.status)}`}
        >
          {getStatusText(candidate.status)}
        </span>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className={`text-blue-600 hover:text-blue-800 text-sm font-medium 
              ${candidate.status !== 'completed' ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={candidate.status !== 'completed'}
            onClick={onShowResults}
          >
            Show Results
          </button>

          <button
            type="button"
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            onClick={() => onDelete(candidate.id)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

export default TableRow