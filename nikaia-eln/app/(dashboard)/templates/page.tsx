'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useExperimentTemplates, useDeleteExperimentTemplate } from '@/lib/hooks/use-templates'
import { formatRelativeDate } from '@/lib/utils/format'
import {
  Plus,
  Search,
  Loader2,
  FilePlus2,
  Trash2
} from 'lucide-react'

export default function TemplatesPage() {
  const [search, setSearch] = useState('')
  const { data: templates, isLoading } = useExperimentTemplates()
  const deleteTemplate = useDeleteExperimentTemplate()

  const filteredTemplates = templates?.filter((t: any) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  ) || []

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate.mutateAsync(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Experiment Templates</h1>
          <p className="text-muted-foreground">
            {templates?.length || 0} templates
          </p>
        </div>
        <Button asChild>
          <Link href="/templates/new">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {search
              ? 'No templates match your search'
              : 'No templates yet. Create your first template to speed up experiment creation.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template: any) => (
            <Card key={template.id} className="group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FilePlus2 className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground line-clamp-2">
                    {template.description || 'No description'}
                  </p>
                  {template.category && (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-muted">
                      {template.category}
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Updated {formatRelativeDate(template.updated_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
