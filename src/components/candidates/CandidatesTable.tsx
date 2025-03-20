"use client"

import React, { useState, useEffect } from 'react'
import { TableToolbar } from './TableToolbar'
import { TableHeader } from './TableHeader'
import { TableRow } from './TableRow'
import { Pagination } from './Pagination'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '@/lib/firebase/config'
import CandidateDrawer from '@/components/candidates/CandidateDrawer'
import { Loader2, AlertCircle, UserPlus, Mail, Link, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Type for candidate data
export interface Candidate {
  id: string
  name: string
  email: string
  cv: {
    url: string
    filename: string
  } | null
  status: 'pending' | 'completed' | 'failed'
  level?: string
  score?: number
}

export const CandidatesTable: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<string>('ux-ui') // for candidate type filter
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<{
    name: string
    level: string
    score: number
    overview?: string
    hardSkills?: string[]
    softSkills?: string[]
    weaknesses?: string[]
    videoUrl?: string
  } | null>(null)

  // Number of records per page
  const rowsPerPage = 10

  // Load candidates from Firebase
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!auth.currentUser) return;

      setLoading(true);
      try {
        // В будущем здесь будет фактическая загрузка данных из Firebase
        // Для начала просто устанавливаем пустой массив, чтобы показать "пустое состояние"
        setCandidates([]);
      } catch (err: any) {
        console.error('Error fetching candidates:', err);
        setError(err.message || 'Failed to load candidates');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [filter]);

  // Handle candidate deletion
  const handleDeleteCandidate = (id: string) => {
    setCandidates(candidates.filter(candidate => candidate.id !== id))
  }

  // Handle adding a candidate
  const handleAddCandidate = (newCandidate: Omit<Candidate, 'id'>) => {
    // In a real application, ID would come from the server
    const id = uuidv4()
    setCandidates([...candidates, { ...newCandidate, id }])
  }

  // Get candidates for current page
  const getCurrentPageCandidates = () => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return candidates.slice(startIndex, startIndex + rowsPerPage)
  }

  // Prepare data for drawer
  const prepareCandidateDrawerData = (candidate: Candidate) => ({
    name: candidate.name,
    level: candidate.level || 'Designer',
    score: candidate.score || 0,
    overview: 'Experienced designer with a strong portfolio in UI/UX design with a focus on user-centered approaches. Demonstrates excellent understanding of design systems and component-based design principles.',
    hardSkills: ['UI Design', 'Prototyping', 'Design Systems', 'Figma', 'User Research'],
    softSkills: ['Communication', 'Collaboration', 'Problem Solving', 'Time Management'],
    weaknesses: ['Technical Implementation Knowledge', 'Public Speaking'],
    videoUrl: undefined
  })

  // Empty state component with onboarding
  const EmptyState = () => (
    <Card className="border border-dashed border-primary/20 bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl text-center font-bold">Start Your AI Recruitment Journey</CardTitle>
        <CardDescription className="text-center text-base">
          Two simple ways to invite candidates for AI assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5 pb-8">
        <div className="flex flex-col items-center space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            {/* Option 1: Email Invite */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 flex flex-col space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-blue-600">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-blue-700">Direct Email Invite</h3>
              </div>
              <p className="text-sm">
                Perfect for inviting <strong>specific candidates</strong> you already have in mind.
              </p>
              <div className="bg-white/80 rounded-lg p-4 border border-blue-100">
                <div className="text-sm mb-2 font-medium text-blue-800">How to do it:</div>
                <ol className="text-sm space-y-2.5 pl-5 list-decimal">
                  <li>Click <strong>"Send Invite"</strong> button</li>
                  <li>Fill in candidate's name and email address</li>
                  <li>They'll receive a personalized assessment link</li>
                </ol>
              </div>
            </div>

            {/* Option 2: Share Link */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-6 flex flex-col space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center text-purple-600">
                  <Link className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-purple-700">Shareable Link</h3>
              </div>
              <p className="text-sm">
                Great for <strong>job postings</strong> or sharing with multiple candidates simultaneously.
              </p>
              <div className="bg-white/80 rounded-lg p-4 border border-purple-100">
                <div className="text-sm mb-2 font-medium text-purple-800">How to do it:</div>
                <ol className="text-sm space-y-2.5 pl-5 list-decimal">
                  <li>Click <strong>"Invite Candidates"</strong> button</li>
                  <li>Generate and copy your unique interview link</li>
                  <li>Include it in job descriptions or messages</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl overflow-hidden w-full max-w-3xl shadow-sm">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="h-5 w-5 text-white" />
                <h3 className="font-semibold text-white">The AI Assessment Process</h3>
              </div>
              <p className="text-white/90 text-sm">How our AI helps you find the perfect candidate</p>
            </div>
            
            <div className="flex flex-col sm:flex-row">
              <div className="flex-1 bg-indigo-50 p-5 border-b sm:border-b-0 sm:border-r border-indigo-100">
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mb-3">1</div>
                  <h4 className="font-semibold text-indigo-800 mb-1">Candidate Takes Assessment</h4>
                  <p className="text-xs text-indigo-700">The candidate completes interactive skill-based challenges tailored to the position</p>
                </div>
              </div>
              
              <div className="flex-1 bg-blue-50 p-5 border-b sm:border-b-0 sm:border-r border-blue-100">
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mb-3">2</div>
                  <h4 className="font-semibold text-blue-800 mb-1">AI Analyzes Performance</h4>
                  <p className="text-xs text-blue-700">Our AI evaluates technical skills, problem-solving abilities, and communication style</p>
                </div>
              </div>
              
              <div className="flex-1 bg-sky-50 p-5">
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold mb-3">3</div>
                  <h4 className="font-semibold text-sky-800 mb-1">Review Detailed Results</h4>
                  <p className="text-xs text-sky-700">View comprehensive reports with scores, strengths, and improvement areas for each candidate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Loading state
  if (loading && candidates.length === 0) {
    return (
      <div className="w-full p-12 text-center">
        <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading candidates...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-md mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex flex-col gap-2">
          <span>{error}</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-fit self-end"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <div className="w-full space-y-4">
        <TableToolbar
          filter={filter}
          onFilterChange={setFilter}
          onAddCandidate={handleAddCandidate}
        />

        {candidates.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="rounded-md border shadow-sm bg-card overflow-x-auto">
            <table className="w-full">
              <colgroup>
                <col className="w-auto sm:w-1/4" /> {/* Name */}
                <col className="w-0 md:w-1/5" /> {/* Email */}
                <col className="w-0 lg:w-12" /> {/* CV */}
                <col className="w-1/6" /> {/* Level */}
                <col className="w-16" /> {/* Score */}
                <col className="w-20" /> {/* Status */}
                <col className="w-24" /> {/* Actions */}
              </colgroup>
              <TableHeader />
              <tbody>
                {getCurrentPageCandidates().map(candidate => (
                  <TableRow
                    key={candidate.id}
                    candidate={candidate}
                    onDelete={handleDeleteCandidate}
                    onShowResults={() => {
                      if (candidate.status === 'completed') {
                        setSelectedCandidate(prepareCandidateDrawerData(candidate))
                      }
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {candidates.length > rowsPerPage && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(candidates.length / rowsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Candidate drawer */}
      <CandidateDrawer
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        candidate={selectedCandidate || undefined}
      />
    </>
  )
}

export default CandidatesTable