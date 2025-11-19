'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Task, useCreateTask, useUpdateTask, useDeleteTask, useUsers } from '@/lib/hooks/use-tasks'
import { useProjects } from '@/lib/hooks/use-projects'
import { Loader2, Trash2 } from 'lucide-react'
import { CommentsSection } from '@/components/comments/comments-section'

interface TaskDialogProps {
  open: boolean
  onClose: () => void
  task?: Task | null
}

export function TaskDialog({ open, onClose, task }: TaskDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<string>('todo')
  const [priority, setPriority] = useState<string>('medium')
  const [projectId, setProjectId] = useState<string>('')
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')

  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const { data: projectsData } = useProjects()
  const { data: users } = useUsers()

  const projects = projectsData?.data || []

  // Initialize form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setStatus(task.status)
      setPriority(task.priority)
      setProjectId(task.project_id || '')
      setAssigneeId(task.assignee_id || '')
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '')
    } else {
      // Reset form for new task
      setTitle('')
      setDescription('')
      setStatus('todo')
      setPriority('medium')
      setProjectId('')
      setAssigneeId('')
      setDueDate('')
    }
  }, [task, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      project_id: projectId || undefined,
      assignee_id: assigneeId || undefined,
      due_date: dueDate || undefined,
    }

    try {
      if (task) {
        await updateTask.mutateAsync({ id: task.id, ...taskData })
      } else {
        await createTask.mutateAsync(taskData)
      }
      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
    }
  }

  const handleDelete = async () => {
    if (!task) return
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await deleteTask.mutateAsync(task.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const isLoading = createTask.isPending || updateTask.isPending

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Project and Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={projectId || 'none'}
                onValueChange={(value) => setProjectId(value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {projects?.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={assigneeId || 'unassigned'}
                onValueChange={(value) => setAssigneeId(value === 'unassigned' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users?.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due-date">Due Date</Label>
            <Input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <DialogFooter className="flex justify-between">
            {task && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteTask.isPending}
              >
                {deleteTask.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !title.trim()}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {task ? 'Save' : 'Create'}
              </Button>
            </div>
          </DialogFooter>
        </form>

        {/* Comments section for existing tasks */}
        {task && (
          <div className="mt-6 pt-6 border-t">
            <CommentsSection entityType="task" entityId={task.id} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
