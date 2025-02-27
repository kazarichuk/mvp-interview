// src/components/candidates/TableToolbar.tsx
"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Candidate } from './CandidatesTable'
import AddCandidateModal from './AddCandidateModal'
import InviteButton from './InviteButton'
import { auth } from '@/lib/firebase/config'
import { getUserInvites } from '@/lib/firebase/invites'

interface TableToolbarProps {
  filter: string
  onFilterChange: (value: string) => void
  onAddCandidate: (candidate: Omit<Candidate, 'id'>) => void
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  filter,
  onFilterChange,
  onAddCandidate
}) => {
  const [invites, setInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    const fetchInvites = async () => {
      if (!auth.currentUser) return;
      
      setLoading(true);
      try {
        const result = await getUserInvites(auth.currentUser.uid);
        if (result.success && result.invites) {
          setInvites(result.invites);
        } else {
          setInvites([]); // Установить пустой массив, если invites не определен
        }
      } catch (err) {
        console.error('Error fetching invites:', err);
        setInvites([]); // Установить пустой массив в случае ошибки
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvites();
  }, []);
  
  // Получаем текущую позицию из фильтра
  const getPositionName = (filterValue: string) => {
    switch (filterValue) {
      case 'ux-ui':
        return 'UX/UI Designer'
      case 'frontend':
        return 'Frontend Developer'
      case 'backend':
        return 'Backend Developer'
      default:
        return 'UX/UI Designer'
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 mb-4">
      <div>
        <h2 className="text-xl font-semibold">My Candidates</h2>
      </div>

      <div className="flex items-center space-x-2 mt-3 sm:mt-0">
        <Select value={filter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="UX/UI Designers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="ux-ui">UX/UI Designers</SelectItem>
            <SelectItem value="frontend">Frontend Developers</SelectItem>
            <SelectItem value="backend">Backend Developers</SelectItem>
          </SelectContent>
        </Select>

        <InviteButton position={getPositionName(filter)} />

        <AddCandidateModal onAddCandidate={onAddCandidate} />
      </div>
    </div>
  )
}

export default TableToolbar