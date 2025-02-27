// src/components/candidates/CandidatesTable.tsx
"use client"

import React, { useState, useEffect } from 'react'
import { TableToolbar } from './TableToolbar'
import { TableHeader } from './TableHeader'
import { TableRow } from './TableRow'
import { Pagination } from './Pagination'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '@/lib/firebase/config'
import CandidateDrawer from '@/components/candidates/CandidateDrawer'

// Тип для данных кандидата
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
  const [filter, setFilter] = useState<string>('ux-ui') // для фильтра типа кандидатов
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

  // Кол-во записей на страницу
  const rowsPerPage = 10

  // Загрузка кандидатов из Firebase
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!auth.currentUser) return;
      
      setLoading(true);
      try {
        // В реальном приложении здесь будет получение данных из Firebase
        // на основе выбранного фильтра и текущего пользователя
        
        // Для MVP используем тестовые данные
        const mockCandidates: Candidate[] = [
          {
            id: '1',
            name: 'Konstantin Kazarichuk',
            email: 'kazarichuk@gmail.com',
            cv: {
              url: '/files/name.pdf',
              filename: 'name.pdf'
            },
            status: 'completed',
            level: 'Senior UX/UI Designer',
            score: 87
          },
          {
            id: '2',
            name: 'John Doe',
            email: 'johndoe@example.com',
            cv: {
              url: '/files/resume.pdf',
              filename: 'resume.pdf'
            },
            status: 'pending',
            level: 'Mid-Level Frontend Developer',
            score: 65
          },
          {
            id: '3',
            name: 'Alice Design',
            email: 'alice@gmail.com',
            cv: {
              url: '/files/name.pdf',
              filename: 'name.pdf'
            },
            status: 'failed',
            level: 'Junior UX Designer',
            score: 42
          }
        ];
        
        setCandidates(mockCandidates);
      } catch (err: any) {
        console.error('Error fetching candidates:', err);
        setError(err.message || 'Failed to load candidates');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidates();
  }, [filter]);

  // Обработчик удаления кандидата
  const handleDeleteCandidate = (id: string) => {
    setCandidates(candidates.filter(candidate => candidate.id !== id))
  }

  // Обработчик добавления кандидата
  const handleAddCandidate = (newCandidate: Omit<Candidate, 'id'>) => {
    // В реальном приложении ID будет приходить с сервера
    const id = uuidv4()
    setCandidates([...candidates, { ...newCandidate, id }])
  }

  // Получаем кандидатов для текущей страницы
  const getCurrentPageCandidates = () => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return candidates.slice(startIndex, startIndex + rowsPerPage)
  }

  // Подготовка данных для drawer
  const prepareCandidateDrawerData = (candidate: Candidate) => ({
    name: candidate.name,
    level: candidate.level || 'Designer', 
    score: candidate.score || 0, 
    overview: 'Experienced designer with a strong portfolio in UI/UX design.',
    hardSkills: ['UI Design', 'Prototyping', 'Design Systems'],
    softSkills: ['Communication', 'Collaboration', 'Problem Solving'],
    weaknesses: ['Time Management', 'Public Speaking'],
    videoUrl: undefined
  })

  if (loading && candidates.length === 0) {
    return (
      <div className="w-full p-12 text-center">
        <div className="h-12 w-12 mx-auto mb-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        <p>Loading candidates...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full p-12 text-center text-red-600">
        <p>{error}</p>
        <button 
          className="mt-4 text-blue-600 hover:underline"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="w-full">
        <TableToolbar
          filter={filter}
          onFilterChange={setFilter}
          onAddCandidate={handleAddCandidate}
        />

        <div className="rounded-md border shadow-sm bg-white">
          <table className="w-full">
            <TableHeader />
            <tbody>
              {getCurrentPageCandidates().length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No candidates found. Start by adding candidates.
                  </td>
                </tr>
              ) : (
                getCurrentPageCandidates().map(candidate => (
                  <TableRow
                    key={candidate.id}
                    candidate={candidate}
                    onDelete={handleDeleteCandidate}
                    onShowResults={() => {
                      // Показываем результаты только для завершенных кандидатов
                      if (candidate.status === 'completed') {
                        setSelectedCandidate(prepareCandidateDrawerData(candidate))
                      }
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {candidates.length > rowsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(candidates.length / rowsPerPage)}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Drawer для выбранного кандидата */}
      <CandidateDrawer 
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        candidate={selectedCandidate || undefined}
      />
    </>
  )
}

export default CandidatesTable