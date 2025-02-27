// src/components/candidates/TableHeader.tsx
import React from 'react'

export const TableHeader: React.FC = () => {
  return (
    <thead>
      <tr className="border-b border-gray-200">
        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
          Name
        </th>
        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
          Email
        </th>
        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
          CV
        </th>
        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
          Level
        </th>
        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
          Score
        </th>
        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
          Status
        </th>
        <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
          Actions
        </th>
      </tr>
    </thead>
  )
}

export default TableHeader