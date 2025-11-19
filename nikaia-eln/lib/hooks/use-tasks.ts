'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  project_id?: string
  assignee_id?: string
  due_date?: string
  created_at: string
  updated_at: string
  user_id: string
  project?: { id: string; name: string }
  assignee?: { id: string; full_name: string; email: string; avatar_url?: string }
}

export function useTasks(filters?: { projectId?: string; status?: string }) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const supabase = createClient()

      let query = supabase
        .from('tasks')
        .select(`
          *,
          project:projects(id, name),
          assignee:users!tasks_assignee_id_fkey(id, full_name, email, avatar_url)
        `)
        .order('created_at', { ascending: false })

      if (filters?.projectId) {
        query = query.eq('project_id', filters.projectId)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Task[]
    },
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          project:projects(id, name),
          assignee:users!tasks_assignee_id_fkey(id, full_name, email, avatar_url)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Task
    },
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (task: {
      title: string
      description?: string
      status?: string
      priority?: string
      project_id?: string
      assignee_id?: string
      due_date?: string
    }) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          user_id: user.id,
          status: task.status || 'todo',
          priority: task.priority || 'medium',
        } as any)
        .select(`
          *,
          project:projects(id, name),
          assignee:users!tasks_assignee_id_fkey(id, full_name, email, avatar_url)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string
      title?: string
      description?: string
      status?: string
      priority?: string
      project_id?: string | null
      assignee_id?: string | null
      due_date?: string | null
    }) => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', id)
        .select(`
          *,
          project:projects(id, name),
          assignee:users!tasks_assignee_id_fkey(id, full_name, email, avatar_url)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()

      const { error } = await supabase.from('tasks').delete().eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// Get all users for assignee selection
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .order('full_name')

      if (error) throw error
      return data
    },
  })
}
