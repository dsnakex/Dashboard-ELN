'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/components/experiments/rich-text-editor'
import { CategorySelect } from './category-select'
import { VisibilityToggle } from './visibility-toggle'
import { Loader2 } from 'lucide-react'

const difficulties = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

interface ProtocolFormProps {
  protocol?: any
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export function ProtocolForm({ protocol, onSubmit, isLoading }: ProtocolFormProps) {
  const router = useRouter()

  const [name, setName] = useState(protocol?.name || '')
  const [description, setDescription] = useState(protocol?.description || '')
  const [category, setCategory] = useState(protocol?.category || '')
  const [visibility, setVisibility] = useState(protocol?.visibility || 'personal')
  const [content, setContent] = useState(protocol?.content || { type: 'doc', content: [] })
  const [estimatedDuration, setEstimatedDuration] = useState(
    protocol?.estimated_duration_minutes?.toString() || ''
  )
  const [difficulty, setDifficulty] = useState(protocol?.difficulty || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      name,
      description,
      category,
      visibility,
      content,
      estimated_duration_minutes: estimatedDuration ? parseInt(estimatedDuration) : null,
      difficulty: difficulty || null,
    })
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{protocol ? 'Edit Protocol' : 'New Protocol'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Protocol name"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CategorySelect
              value={category}
              onChange={setCategory}
              showLabel
              includeAll={false}
            />

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isLoading}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select...</option>
                {difficulties.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Estimated Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              placeholder="e.g., 60"
              min="1"
              disabled={isLoading}
            />
          </div>

          <VisibilityToggle
            value={visibility}
            onChange={setVisibility}
          />

          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Write your protocol content here..."
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
          <Button type="submit" disabled={isLoading || !name}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {protocol ? 'Save Changes' : 'Create Protocol'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
