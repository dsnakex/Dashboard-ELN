'use client'

import { useState } from 'react'
import { TimelineItem } from './timeline-item'
import { TimelineFilters } from './timeline-filters'
import { useExperiments } from '@/lib/hooks/use-experiments'
import { Loader2 } from 'lucide-react'

export function ExperimentTimeline() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [projectId, setProjectId] = useState('')

  const { data, isLoading, error } = useExperiments({
    status: status || undefined,
    projectId: projectId || undefined,
    search: search || undefined,
    limit: 50,
  })

  const experiments = data?.data || []

  // Group experiments by date
  const groupedByDate: Record<string, any[]> = {}
  experiments.forEach((exp: any) => {
    const date = new Date(exp.updated_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!groupedByDate[date]) {
      groupedByDate[date] = []
    }
    groupedByDate[date].push(exp)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Timeline</h1>
        <p className="text-muted-foreground">
          Chronological view of your experiments
        </p>
      </div>

      {/* Filters */}
      <TimelineFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        projectId={projectId}
        onProjectChange={setProjectId}
      />

      {/* Timeline */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load timeline</p>
        </div>
      ) : experiments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {search || status || projectId
              ? 'No experiments match your filters'
              : 'No experiments yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByDate).map(([date, exps]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-4 sticky top-0 bg-background py-2">
                {date}
              </h2>
              <div className="space-y-3 border-l-2 border-muted pl-4 ml-2">
                {exps.map((exp: any) => (
                  <div key={exp.id} className="relative">
                    <div className="absolute -left-[22px] top-6 h-2 w-2 rounded-full bg-primary" />
                    <TimelineItem experiment={exp} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
