// src/components/candidates/TableToolbar.tsx
"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
  SelectSeparator
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Candidate } from './CandidatesTable'
import AddCandidateModal from './AddCandidateModal'
import InviteButton from './InviteButton'
import { auth } from '@/lib/firebase/config'
import { getUserInvites } from '@/lib/firebase/invites'
import { Users, Filter } from 'lucide-react'

interface TableToolbarProps {
  filter: string
  onFilterChange: (value: string) => void
  onAddCandidate: (candidate: Omit<Candidate, 'id'>) => void
}

type CategoryType = {
  value: string
  label: string
  available: boolean
  description?: string
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  filter,
  onFilterChange,
  onAddCandidate
}) => {
  const [invites, setInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const categories: CategoryType[] = [
    { value: 'ux-ui', label: 'UX/UI Designers', available: true },
    { 
      value: 'frontend', 
      label: 'Frontend Developers', 
      available: false, 
      description: 'Coming in May 2025'
    },
    { 
      value: 'backend', 
      label: 'Backend Developers', 
      available: false,
      description: 'Coming in June 2025'
    },
    { 
      value: 'analytics', 
      label: 'Data Analytics', 
      available: false,
      description: 'Coming in April 2025'
    }
  ]
  
  useEffect(() => {
    const fetchInvites = async () => {
      if (!auth.currentUser) return;
      
      setLoading(true);
      try {
        const result = await getUserInvites(auth.currentUser.uid);
        if (result.success && result.invites) {
          setInvites(result.invites);
        } else {
          setInvites([]); 
        }
      } catch (err) {
        console.error('Error fetching invites:', err);
        setInvites([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvites();
  }, []);
  
  // Get the current position name from the filter
  const getPositionName = (filterValue: string) => {
    const category = categories.find(cat => cat.value === filterValue);
    return category?.label || 'UX/UI Designer';
  }

  // Handle filter change with validation
  const handleFilterChange = (value: string) => {
    const category = categories.find(cat => cat.value === value);
    
    if (category && category.available) {
      onFilterChange(value);
    } else if (value === 'all') {
      onFilterChange(value);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 mb-6">
      <div>
        <h2 className="text-2xl font-bold">My Candidates</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage and track your candidate assessments
        </p>
      </div>

      <div className="flex items-center gap-3 mt-4 sm:mt-0">
        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[200px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Select Category" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Available Categories</SelectLabel>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.filter(cat => cat.available).map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectGroup>
            
            <SelectSeparator />
            
            <SelectGroup>
              <SelectLabel>Coming Soon</SelectLabel>
              {categories.filter(cat => !cat.available).map(category => (
                <SelectItem 
                  key={category.value} 
                  value={category.value} 
                  disabled
                  className="flex justify-between items-center"
                >
                  <span>{category.label}</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-muted">
                    {category.description}
                  </Badge>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <InviteButton position={getPositionName(filter)} />

        <AddCandidateModal onAddCandidate={onAddCandidate} />
      </div>
    </div>
  )
}

export default TableToolbar