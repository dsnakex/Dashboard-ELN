'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExperimentCard } from './experiment-card'
import { ExperimentTable } from './experiment-table'
import { StatusFilter } from './filters/status-filter'
import { ProjectFilter } from './filters/project-filter'
import { useExperiments } from '@/lib/hooks/use-experiments'
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

export function ExperimentBrowser() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, error } = useExperiments({
    status: statusFilter || undefined,
    projectId: projectFilter || undefined,
    search: search || undefined,
    page,
    limit,
  })

  const experiments = data?.data || []
  const totalCount = data?.count || 0
  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Experiments</h1>
          <p className="text-muted-foreground">
            {totalCount} experiments
          </p>
        </div>
        <Button asChild>
          <Link href="/experiments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Experiment
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search experiments..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <StatusFilter
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value)
            setPage(1)
          }}
        />
        <ProjectFilter
          value={projectFilter}
          onChange={(value) => {
            setProjectFilter(value)
            setPage(1)
          }}
        />
        <div className="flex-1" />
        <div className="flex items-center border rounded-md">
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('grid')}
            className="rounded-r-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load experiments</p>
        </div>
      ) : experiments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {search || statusFilter || projectFilter
              ? 'No experiments match your filters'
              : 'No experiments yet. Create your first experiment to get started.'}
          </p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {experiments.map((experiment: any) => (
            <ExperimentCard key={experiment.id} experiment={experiment} />
          ))}
        </div>
      ) : (
        <ExperimentTable experiments={experiments} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
