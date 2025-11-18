'use client'

import Link from 'next/link'
import { StatusBadge } from './status-badge'
import { formatRelativeDate } from '@/lib/utils/format'
import { FlaskConical } from 'lucide-react'

interface TimelineItemProps {
  experiment: any
}

export function TimelineItem({ experiment }: TimelineItemProps) {
  return (
    <Link
      href={`/experiments/${experiment.id}`}
      className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
    >
      <div className="flex-shrink-0 mt-1">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <FlaskConical className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium truncate">{experiment.name}</h3>
            <p className="text-sm text-muted-foreground">
              {experiment.study?.project?.name} / {experiment.study?.name}
            </p>
          </div>
          <StatusBadge status={experiment.status} />
        </div>
        {experiment.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {experiment.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Updated {formatRelativeDate(experiment.updated_at)}
        </p>
      </div>
    </Link>
  )
}
