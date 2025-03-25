"use client"

import React from 'react'
import { FileText, Eye, Award } from 'lucide-react'
import { Candidate } from './CandidatesTable'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import DeleteCandidateDialog from './DeleteCandidateDialog'

interface TableRowProps {
  candidate: Candidate & {
    level?: string
    score?: number
    inviteId?: string
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
    const maxLength = 15
    if (candidate.name.length <= maxLength) {
      return <>{candidate.name}</>
    }

    return (
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger className="cursor-default underline underline-offset-2 decoration-dotted">
          <span>{`${candidate.name.slice(0, maxLength)}...`}</span>
        </HoverCardTrigger>
        <HoverCardContent
          side="right"
          align="start"
          className="bg-white shadow-lg border rounded-md p-2 text-sm w-auto"
        >
          {candidate.name}
        </HoverCardContent>
      </HoverCard>
    )
  }

  // Truncate email with hover card
  const TruncatedEmail: React.FC = () => {
    const maxLength = 18
    if (!candidate.email || candidate.email.length <= maxLength) {
      return <>{candidate.email}</>
    }

    return (
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger className="cursor-default underline underline-offset-2 decoration-dotted">
          <span>{`${candidate.email.slice(0, maxLength)}...`}</span>
        </HoverCardTrigger>
        <HoverCardContent
          side="right"
          align="start"
          className="bg-white shadow-lg border rounded-md p-2 text-sm w-auto"
        >
          {candidate.email}
        </HoverCardContent>
      </HoverCard>
    )
  }

  // Determine status variant
  const getStatusVariant = (status: string): "default" | "destructive" | "outline" | "secondary" | null | undefined => {
    switch (status) {
      case 'completed':
        return "default"
      case 'pending':
        return "secondary"
      case 'failed':
        return "destructive"
      default:
        return "outline"
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
      'bg-emerald-500',
      'bg-amber-500',
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

  // Score color based on value
  const getScoreColor = (score?: number) => {
    if (score === undefined) return "text-gray-400"
    if (score >= 80) return "text-emerald-600 font-medium"
    if (score >= 60) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <tr className="border-b border-border/40 hover:bg-muted/30 transition-colors">
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div
            className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(candidate.name)}`}
          >
            {getInitials(candidate.name)}
          </div>
          <div className="font-medium">
            <TruncatedName />
          </div>
        </div>
      </td>

      <td className="hidden md:table-cell px-3 py-3 whitespace-nowrap">
        <div className="text-sm text-muted-foreground">
          <TruncatedEmail />
        </div>
      </td>

      <td className="hidden lg:table-cell px-3 py-3 whitespace-nowrap">
        {candidate.cv ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={candidate.cv.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary hover:text-primary/80"
                >
                  <FileText className="h-4 w-4" />
                  <span className="sr-only">{candidate.cv.filename}</span>
                </a>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>View CV: {candidate.cv.filename}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-muted-foreground text-sm italic">None</span>
        )}
      </td>

      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex items-center text-sm">
          <Award className="h-3.5 w-3.5 mr-1 text-amber-500" />
          {candidate.level || 'N/A'}
        </div>
      </td>

      <td className="px-3 py-3 whitespace-nowrap">
        <div className={`text-sm ${getScoreColor(candidate.score)}`}>
          {candidate.score !== undefined ? `${candidate.score}` : '-'}
        </div>
      </td>

      <td className="px-3 py-3 whitespace-nowrap">
        <Badge variant={getStatusVariant(candidate.status)} className="text-xs font-normal">
          {getStatusText(candidate.status)}
        </Badge>
      </td>

      <td className="px-3 py-3 whitespace-nowrap text-right">
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            className={`h-8 px-2 ${candidate.status !== 'completed' ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={candidate.status !== 'completed'}
            onClick={onShowResults}
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Results</span>
          </Button>

          <DeleteCandidateDialog
            candidateId={candidate.id}
            candidateName={candidate.name}
            inviteId={candidate.inviteId}
            onDelete={onDelete}
          />
        </div>
      </td>
    </tr>
  )
}

export default TableRow