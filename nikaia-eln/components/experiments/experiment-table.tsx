'use client'

import Link from 'next/link'
import { StatusBadge } from './status-badge'
import { formatRelativeDate } from '@/lib/utils/format'
import { FlaskConical } from 'lucide-react'

interface ExperimentTableProps {
  experiments: any[]
}

export function ExperimentTable({ experiments }: ExperimentTableProps) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
              Name
            </th>
            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
              Project / Study
            </th>
            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
              Status
            </th>
            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
              Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {experiments.map((experiment) => (
            <tr key={experiment.id} className="border-b hover:bg-muted/50">
              <td className="p-4">
                <Link
                  href={`/experiments/${experiment.id}`}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <FlaskConical className="h-4 w-4 text-primary" />
                  <span className="font-medium">{experiment.name}</span>
                </Link>
              </td>
              <td className="p-4 text-sm text-muted-foreground">
                <div>
                  {experiment.study?.project?.name || 'No project'}
                </div>
                <div className="text-xs">
                  {experiment.study?.name || 'No study'}
                </div>
              </td>
              <td className="p-4">
                <StatusBadge status={experiment.status} />
              </td>
              <td className="p-4 text-sm text-muted-foreground">
                {formatRelativeDate(experiment.updated_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
