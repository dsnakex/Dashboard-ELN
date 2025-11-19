'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useActivityLog } from '@/lib/hooks/use-dashboard'
import { formatRelativeDate } from '@/lib/utils/format'

const actionLabels: Record<string, string> = {
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
  signed: 'Signed',
  exported: 'Exported',
  shared: 'Shared',
}

const entityLabels: Record<string, string> = {
  experiments: 'experiment',
  protocols: 'protocol',
  samples: 'sample',
  projects: 'project',
  studies: 'study',
  files: 'file',
  equipment: 'equipment',
  storage_units: 'storage unit',
}

export function ActivityFeed() {
  const { data: activities, isLoading, error } = useActivityLog(10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>Recent actions in your lab</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">
            Unable to load activity
          </p>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity: any) => {
              const user = activity.user
              const initials = user?.full_name
                ? user.full_name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : user?.email?.slice(0, 2).toUpperCase() || '??'

              return (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      {actionLabels[activity.action] || activity.action}{' '}
                      {entityLabels[activity.entity_type] || activity.entity_type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeDate(activity.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        )}
      </CardContent>
    </Card>
  )
}
