'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Folder,
  FlaskConical,
  ClipboardList,
  Box,
  FileText,
  Settings,
  Plus,
  Search,
  Calendar
} from 'lucide-react'

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [experiments, setExperiments] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [protocols, setProtocols] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Toggle with Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Search when query changes
  useEffect(() => {
    if (!search || search.length < 2) {
      setExperiments([])
      setProjects([])
      setProtocols([])
      return
    }

    const searchData = async () => {
      setLoading(true)
      const supabase = createClient()

      const [expRes, projRes, protRes] = await Promise.all([
        supabase
          .from('experiments')
          .select('id, name, status')
          .ilike('name', `%${search}%`)
          .limit(5),
        supabase
          .from('projects')
          .select('id, name')
          .ilike('name', `%${search}%`)
          .limit(5),
        supabase
          .from('protocols')
          .select('id, name')
          .ilike('name', `%${search}%`)
          .eq('is_active', true)
          .limit(5),
      ])

      setExperiments(expRes.data || [])
      setProjects(projRes.data || [])
      setProtocols(protRes.data || [])
      setLoading(false)
    }

    const debounce = setTimeout(searchData, 300)
    return () => clearTimeout(debounce)
  }, [search])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed inset-0 z-50"
    >
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-lg bg-background rounded-lg shadow-lg border overflow-hidden">
        <Command.Input
          value={search}
          onValueChange={setSearch}
          placeholder="Type a command or search..."
          className="w-full px-4 py-3 text-sm border-b outline-none bg-transparent"
        />
        <Command.List className="max-h-80 overflow-y-auto p-2">
          {loading && (
            <Command.Loading className="py-6 text-center text-sm text-muted-foreground">
              Searching...
            </Command.Loading>
          )}

          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          {/* Navigation */}
          <Command.Group heading="Navigation" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
            <Command.Item
              onSelect={() => runCommand(() => router.push('/'))}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer aria-selected:bg-accent"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/projects'))}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer aria-selected:bg-accent"
            >
              <Folder className="h-4 w-4" />
              Projects
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/experiments'))}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer aria-selected:bg-accent"
            >
              <FlaskConical className="h-4 w-4" />
              Experiments
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/experiments/timeline'))}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer aria-selected:bg-accent"
            >
              <Calendar className="h-4 w-4" />
              Timeline
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/protocols'))}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer aria-selected:bg-accent"
            >
              <ClipboardList className="h-4 w-4" />
              Protocols
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/inventory'))}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer aria-selected:bg-accent"
            >
              <Box className="h-4 w-4" />
              Inventory
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/files'))}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer aria-selected:bg-accent"
            >
              <FileText className="h-4 w-4" />
              Files
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/settings'))}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer aria-selected:bg-accent"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Command.Item>
          </Command.Group>

          {/* Quick Actions */}
          <Command.Group heading="Quick Actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
            <Command.Item
              onSelect={() => runCommand(() => router.push('/experiments/new'))}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer aria-selected:bg-accent"
            >
              <Plus className="h-4 w-4" />
              New Experiment
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/projects/new'))}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer aria-selected:bg-accent"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/protocols/new'))}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer aria-selected:bg-accent"
            >
              <Plus className="h-4 w-4" />
              New Protocol
            </Command.Item>
          </Command.Group>

          {/* Search Results - Experiments */}
          {experiments.length > 0 && (
            <Command.Group heading="Experiments" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
              {experiments.map((exp) => (
                <Command.Item
                  key={exp.id}
                  onSelect={() => runCommand(() => router.push(`/experiments/${exp.id}`))}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer aria-selected:bg-accent"
                >
                  <FlaskConical className="h-4 w-4 text-primary" />
                  <span>{exp.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground capitalize">
                    {exp.status}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Search Results - Projects */}
          {projects.length > 0 && (
            <Command.Group heading="Projects" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
              {projects.map((proj) => (
                <Command.Item
                  key={proj.id}
                  onSelect={() => runCommand(() => router.push(`/projects/${proj.id}`))}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer aria-selected:bg-accent"
                >
                  <Folder className="h-4 w-4 text-primary" />
                  {proj.name}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Search Results - Protocols */}
          {protocols.length > 0 && (
            <Command.Group heading="Protocols" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
              {protocols.map((prot) => (
                <Command.Item
                  key={prot.id}
                  onSelect={() => runCommand(() => router.push(`/protocols/${prot.id}`))}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer aria-selected:bg-accent"
                >
                  <ClipboardList className="h-4 w-4 text-primary" />
                  {prot.name}
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
            <span className="text-xs">⌘</span>K
          </kbd>
          <span className="ml-2">to toggle</span>
        </div>
      </div>
    </Command.Dialog>
  )
}
