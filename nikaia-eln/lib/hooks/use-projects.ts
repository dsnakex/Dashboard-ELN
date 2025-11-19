'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// Fetch all projects
export function useProjects(options?: { status?: string; page?: number; limit?: number }) {
  const { status, page = 1, limit = 20 } = options || {}

  return useQuery({
    queryKey: ['projects', { status, page, limit }],
    queryFn: async () => {
      const supabase = createClient()

      let query = supabase
        .from('projects')
        .select('*, studies(count)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { data, count }
    },
  })
}

// Fetch single project
export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          studies(
            id,
            name,
            description,
            created_at,
            experiments(count)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

// Create project
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      description?: string
      status?: string
    }) => {
      const supabase = createClient()

      const { data: project, error } = await supabase
        .from('projects')
        .insert(data as any)
        .select()
        .single()

      if (error) throw error
      return project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create project')
    },
  })
}

// Update project
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string
      name?: string
      description?: string
      status?: string
    }) => {
      const supabase = createClient()

      const { data: project, error } = await supabase
        .from('projects')
        .update(data as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return project
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] })
      toast.success('Project updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update project')
    },
  })
}

// Delete project
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete project')
    },
  })
}
