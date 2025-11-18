'use client'

import { Input } from '@/components/ui/input'
import { StatusFilter } from './filters/status-filter'
import { ProjectFilter } from './filters/project-filter'
import { Search } from 'lucide-react'

interface TimelineFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  projectId: string
  onProjectChange: (value: string) => void
}

export function TimelineFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  projectId,
  onProjectChange,
}: TimelineFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search experiments..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <StatusFilter value={status} onChange={onStatusChange} />
      <ProjectFilter value={projectId} onChange={onProjectChange} />
    </div>
  )
}
