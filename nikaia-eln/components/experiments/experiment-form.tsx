'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from './rich-text-editor'
import { StatusSelect } from './status-select'
import { useProjects } from '@/lib/hooks/use-projects'
import { useStudies } from '@/lib/hooks/use-studies'
import { Loader2 } from 'lucide-react'

interface ExperimentFormProps {
  experiment?: any
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export function ExperimentForm({ experiment, onSubmit, isLoading }: ExperimentFormProps) {
  const router = useRouter()
  const { data: projectsData } = useProjects()

  const [name, setName] = useState(experiment?.name || '')
  const [description, setDescription] = useState(experiment?.description || '')
  const [status, setStatus] = useState(experiment?.status || 'configuring')
  const [content, setContent] = useState(experiment?.content || { type: 'doc', content: [] })
  const [selectedProjectId, setSelectedProjectId] = useState(experiment?.study?.project?.id || '')
  const [studyId, setStudyId] = useState(experiment?.study_id || '')

  const { data: studiesData } = useStudies(selectedProjectId)

  const projects = (projectsData as any)?.data || []
  const studies = studiesData || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      name,
      description,
      status,
      content,
      study_id: studyId,
    })
  }

  const handleSaveAsDraft = async () => {
    await onSubmit({
      name,
      description,
      status: 'configuring',
      content,
      study_id: studyId,
    })
  }

  const handleSaveAndStart = async () => {
    await onSubmit({
      name,
      description,
      status: 'in_progress',
      content,
      study_id: studyId,
    })
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{experiment ? 'Edit Experiment' : 'New Experiment'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Experiment name"
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <select
                id="project"
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value)
                  setStudyId('')
                }}
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select project...</option>
                {projects.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="study">Study *</Label>
              <select
                id="study"
                value={studyId}
                onChange={(e) => setStudyId(e.target.value)}
                disabled={isLoading || !selectedProjectId}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select study...</option>
                {studies.map((study: any) => (
                  <option key={study.id} value={study.id}>
                    {study.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <StatusSelect
            value={status}
            onChange={setStatus}
            disabled={isLoading}
          />

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the experiment..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Write your experiment notes here..."
              readOnly={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          {!experiment && (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveAsDraft}
                disabled={isLoading || !name || !studyId}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save as Draft
              </Button>
              <Button
                type="button"
                onClick={handleSaveAndStart}
                disabled={isLoading || !name || !studyId}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save & Start
              </Button>
            </>
          )}
          {experiment && (
            <Button type="submit" disabled={isLoading || !name || !studyId}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
