'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelativeDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { ClipboardList, Clock, User, Users, Globe } from 'lucide-react'

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/10 text-green-500',
  medium: 'bg-amber-500/10 text-amber-500',
  hard: 'bg-red-500/10 text-red-500',
}

const visibilityIcons: Record<string, React.ElementType> = {
  personal: User,
  group: Users,
  public: Globe,
}

interface ProtocolCardProps {
  protocol: any
}

export function ProtocolCard({ protocol }: ProtocolCardProps) {
  const VisibilityIcon = visibilityIcons[protocol.visibility] || User

  return (
    <Link href={`/protocols/${protocol.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <ClipboardList className="h-4 w-4 text-primary flex-shrink-0" />
              <CardTitle className="text-base truncate">{protocol.name}</CardTitle>
            </div>
            <VisibilityIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground line-clamp-2">
              {protocol.description || 'No description'}
            </p>
            <div className="flex flex-wrap gap-2">
              {protocol.category && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {protocol.category}
                </span>
              )}
              {protocol.difficulty && (
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full capitalize',
                  difficultyColors[protocol.difficulty]
                )}>
                  {protocol.difficulty}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {protocol.estimated_duration_minutes && (
                <>
                  <Clock className="h-3 w-3" />
                  <span>{protocol.estimated_duration_minutes} min</span>
                  <span>•</span>
                </>
              )}
              <span>Updated {formatRelativeDate(protocol.updated_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
