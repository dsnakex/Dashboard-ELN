'use client'

import { useProjects } from '@/lib/hooks/use-projects'

interface ProjectFilterProps {
  value: string
  onChange: (value: string) => void
}

export function ProjectFilter({ value, onChange }: ProjectFilterProps) {
  const { data } = useProjects()
  const projects = (data as any)?.data || []

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <option value="">All Projects</option>
      {projects.map((project: any) => (
        <option key={project.id} value={project.id}>
          {project.name}
        </option>
      ))}
    </select>
  )
}
