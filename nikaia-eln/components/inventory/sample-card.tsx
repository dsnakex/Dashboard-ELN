'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelativeDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { TestTube, MapPin } from 'lucide-react'

const statusColors: Record<string, string> = {
  available: 'bg-green-500/10 text-green-500',
  in_use: 'bg-blue-500/10 text-blue-500',
  depleted: 'bg-gray-500/10 text-gray-500',
  expired: 'bg-red-500/10 text-red-500',
}

interface SampleCardProps {
  sample: any
}

export function SampleCard({ sample }: SampleCardProps) {
  return (
    <Link href={`/inventory/samples/${sample.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <TestTube className="h-4 w-4 text-primary flex-shrink-0" />
              <CardTitle className="text-base truncate">{sample.name}</CardTitle>
            </div>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full capitalize',
              statusColors[sample.status]
            )}>
              {sample.status}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground capitalize">
                {sample.sample_type?.replace('_', ' ')}
              </span>
              {sample.quantity && (
                <span className="font-medium">
                  {sample.quantity} {sample.unit}
                </span>
              )}
            </div>
            {sample.storage_unit && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {sample.storage_unit.name}
                {sample.position && ` - ${sample.position}`}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Added {formatRelativeDate(sample.created_at)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
