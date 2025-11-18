'use client'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'
import { User, Users, Globe } from 'lucide-react'

const visibilities = [
  { value: 'personal', label: 'Personal', icon: User, description: 'Only you' },
  { value: 'group', label: 'Group', icon: Users, description: 'Your team' },
  { value: 'public', label: 'Public', icon: Globe, description: 'Everyone' },
]

interface VisibilityToggleProps {
  value: string
  onChange: (value: string) => void
}

export function VisibilityToggle({ value, onChange }: VisibilityToggleProps) {
  return (
    <div className="space-y-2">
      <Label>Visibility</Label>
      <div className="grid grid-cols-3 gap-2">
        {visibilities.map((vis) => (
          <button
            key={vis.value}
            type="button"
            onClick={() => onChange(vis.value)}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors',
              value === vis.value
                ? 'border-primary bg-primary/5'
                : 'border-transparent bg-muted hover:bg-muted/80'
            )}
          >
            <vis.icon className={cn(
              'h-5 w-5',
              value === vis.value ? 'text-primary' : 'text-muted-foreground'
            )} />
            <span className="text-sm font-medium">{vis.label}</span>
            <span className="text-xs text-muted-foreground">{vis.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
