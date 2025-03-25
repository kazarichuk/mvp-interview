import React from 'react'
import { ArrowUpDown } from 'lucide-react'

export const TableHeader: React.FC = () => {
  return (
    <thead>
      <tr className="border-b bg-muted/40">
        <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <span>Name</span>
            <ArrowUpDown className="h-3 w-3 text-muted-foreground/70" />
          </div>
        </th>
        <th className="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <span>Email</span>
            <ArrowUpDown className="h-3 w-3 text-muted-foreground/70" />
          </div>
        </th>
        <th className="hidden lg:table-cell px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          CV
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <span>Level</span>
            <ArrowUpDown className="h-3 w-3 text-muted-foreground/70" />
          </div>
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <span>Score</span>
            <ArrowUpDown className="h-3 w-3 text-muted-foreground/70" />
          </div>
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <span>Status</span>
            <ArrowUpDown className="h-3 w-3 text-muted-foreground/70" />
          </div>
        </th>
        <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  )
}

export default TableHeader