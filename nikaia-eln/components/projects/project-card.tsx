import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Folder, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description?: string | null
    status: string
    created_at: string
    studies?: { count: number }[]
  }
  onEdit?: () => void
  onDelete?: () => void
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-500',
  completed: 'bg-blue-500/10 text-blue-500',
  archived: 'bg-gray-500/10 text-gray-500',
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const studyCount = project.studies?.[0]?.count ?? 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Folder className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Link href={`/projects/${project.id}`}>
                <CardTitle className="text-lg hover:text-primary transition-colors">
                  {project.name}
                </CardTitle>
              </Link>
              <CardDescription className="text-xs">
                {formatRelativeDate(project.created_at)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {project.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {project.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {studyCount} {studyCount === 1 ? 'study' : 'studies'}
          </span>
          <span className={cn('text-xs px-2 py-1 rounded-full', statusColors[project.status] || statusColors.active)}>
            {project.status}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
