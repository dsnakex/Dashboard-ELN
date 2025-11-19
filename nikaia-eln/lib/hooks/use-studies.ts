'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// Fetch studies for a project
export function useStudies(projectId: string) {
  return useQuery({
    queryKey: ['studies', { projectId }],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('studies')
        .select(`
          *,
          experiments(count)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!projectId,
  })
}

// Fetch single study
export function useStudy(id: string) {
  return useQuery({
    queryKey: ['studies', id],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('studies')
        .select(`
          *,
          project:projects(id, name),
          experiments(
            id,
            name,
            status,
            created_at,
            updated_at
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

// Create study
export function useCreateStudy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      description?: string
      project_id: string
    }) => {
      const supabase = createClient()

      const { data: study, error } = await supabase
        .from('studies')
        .insert(data as any)
        .select()
        .single()

      if (error) throw error
      return study
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['studies', { projectId: variables.project_id }] })
      queryClient.invalidateQueries({ queryKey: ['projects', variables.project_id] })
      toast.success('Study created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create study')
    },
  })
}

// Update study
export function useUpdateStudy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string
      name?: string
      description?: string
    }) => {
      const supabase = createClient()

      const { data: study, error } = await supabase
        .from('studies')
        .update(data as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return study
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['studies'] })
      queryClient.invalidateQueries({ queryKey: ['studies', variables.id] })
      toast.success('Study updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update study')
    },
  })
}

// Delete study
export function useDeleteStudy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()

      const { error } = await supabase
        .from('studies')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studies'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Study deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete study')
    },
  })
}
