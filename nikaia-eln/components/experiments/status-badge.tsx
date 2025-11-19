'use client'

import { cn } from '@/lib/utils/cn'

const statusConfig: Record<string, { label: string; className: string }> = {
  configuring: {
    label: 'Configuring',
    className: 'bg-slate-500/10 text-slate-500',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/10 text-amber-500',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-500/10 text-blue-500',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-500/10 text-green-500',
  },
  signed: {
    label: 'Signed',
    className: 'bg-purple-500/10 text-purple-500',
  },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-muted text-muted-foreground',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
