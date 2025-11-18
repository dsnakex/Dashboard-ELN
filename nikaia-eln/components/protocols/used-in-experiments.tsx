'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/experiments/status-badge'
import { useProtocolExperiments } from '@/lib/hooks/use-protocols'
import { formatRelativeDate } from '@/lib/utils/format'
import { FlaskConical, Loader2 } from 'lucide-react'

interface UsedInExperimentsProps {
  protocolId: string
}

export function UsedInExperiments({ protocolId }: UsedInExperimentsProps) {
  const { data: experiments, isLoading } = useProtocolExperiments(protocolId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Used in Experiments</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : experiments && experiments.length > 0 ? (
          <div className="space-y-3">
            {experiments.map((exp: any) => (
              <Link
                key={exp.id}
                href={`/experiments/${exp.id}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FlaskConical className="h-4 w-4 text-primary" />
                  <div>
                    <h4 className="font-medium">{exp.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {exp.study?.project?.name} / {exp.study?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(exp.updated_at)}
                  </span>
                  <StatusBadge status={exp.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            This protocol hasn't been used in any experiments yet.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
