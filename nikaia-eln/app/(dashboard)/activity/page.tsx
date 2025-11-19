'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useActivityLog } from '@/lib/hooks/use-activity'
import { formatRelativeDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  FileText,
  FlaskConical,
  Folder,
  ClipboardList
} from 'lucide-react'

const actionIcons: Record<string, React.ElementType> = {
  created: Plus,
  updated: Pencil,
  deleted: Trash2,
  signed: CheckCircle,
  exported: FileText,
}

const actionColors: Record<string, string> = {
  created: 'text-green-500 bg-green-500/10',
  updated: 'text-blue-500 bg-blue-500/10',
  deleted: 'text-red-500 bg-red-500/10',
  signed: 'text-purple-500 bg-purple-500/10',
  exported: 'text-amber-500 bg-amber-500/10',
}

const entityIcons: Record<string, React.ElementType> = {
  experiment: FlaskConical,
  project: Folder,
  protocol: ClipboardList,
}

export default function ActivityPage() {
  const { data: activities, isLoading } = useActivityLog({ limit: 100 })

  // Group by date
  const groupedByDate: Record<string, any[]> = {}
  activities?.forEach((activity: any) => {
    const date = new Date(activity.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!groupedByDate[date]) {
      groupedByDate[date] = []
    }
    groupedByDate[date].push(activity)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground">
          Recent activity in your workspace
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !activities || activities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No activity recorded yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByDate).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-4 sticky top-14 bg-background py-2 z-10">
                {date}
              </h2>
              <div className="space-y-3">
                {items.map((activity: any) => {
                  const ActionIcon = actionIcons[activity.action] || Plus
                  const EntityIcon = entityIcons[activity.entity_type] || FileText
                  const actionColor = actionColors[activity.action] || 'text-muted-foreground bg-muted'

                  return (
                    <Card key={activity.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
                            actionColor
                          )}>
                            <ActionIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <EntityIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium capitalize">
                                {activity.action} {activity.entity_type}
                              </span>
                            </div>
                            {activity.changes && Object.keys(activity.changes).length > 0 && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {JSON.stringify(activity.changes)}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatRelativeDate(activity.created_at)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
