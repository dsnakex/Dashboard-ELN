'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRecentExperiments } from '@/lib/hooks/use-dashboard'
import { formatRelativeDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

const statusColors: Record<string, string> = {
  configuring: 'bg-slate-500',
  pending: 'bg-amber-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  signed: 'bg-purple-500',
}

const statusLabels: Record<string, string> = {
  configuring: 'Configuring',
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  signed: 'Signed',
}

export function RecentExperiments() {
  const { data: experiments, isLoading, error } = useRecentExperiments(5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Experiments</CardTitle>
        <CardDescription>Your latest experiment activity</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">
            Unable to load experiments
          </p>
        ) : experiments && experiments.length > 0 ? (
          <div className="space-y-4">
            {experiments.map((exp: any) => (
              <Link
                key={exp.id}
                href={`/experiments/${exp.id}`}
                className="flex items-center gap-4 hover:bg-muted/50 -mx-2 px-2 py-1 rounded-md transition-colors"
              >
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    statusColors[exp.status] || 'bg-gray-500'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{exp.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeDate(exp.updated_at)}
                  </p>
                </div>
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    exp.status === 'in_progress'
                      ? 'bg-blue-500/10 text-blue-500'
                      : exp.status === 'completed'
                      ? 'bg-green-500/10 text-green-500'
                      : exp.status === 'signed'
                      ? 'bg-purple-500/10 text-purple-500'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {statusLabels[exp.status] || exp.status}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No experiments yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}
