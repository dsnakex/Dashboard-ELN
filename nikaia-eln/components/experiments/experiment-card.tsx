'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from './status-badge'
import { formatRelativeDate } from '@/lib/utils/format'
import { FlaskConical } from 'lucide-react'

interface ExperimentCardProps {
  experiment: any
}

export function ExperimentCard({ experiment }: ExperimentCardProps) {
  const studyName = experiment.study?.name || 'No study'
  const projectName = experiment.study?.project?.name || 'No project'

  return (
    <Link href={`/experiments/${experiment.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FlaskConical className="h-4 w-4 text-primary flex-shrink-0" />
              <CardTitle className="text-base truncate">{experiment.name}</CardTitle>
            </div>
            <StatusBadge status={experiment.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground line-clamp-2">
              {experiment.description || 'No description'}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{projectName}</span>
              <span>•</span>
              <span>{studyName}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Updated {formatRelativeDate(experiment.updated_at)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
