'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export function useExperimentTemplates(options?: { category?: string }) {
  const { category } = options || {}

  return useQuery({
    queryKey: ['experiment-templates', { category }],
    queryFn: async () => {
      const supabase = createClient()

      let query = supabase
        .from('experiment_templates')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (category) query = query.eq('category', category)

      const { data, error } = await query
      if (error) throw error
      return data || []
    },
  })
}

export function useExperimentTemplate(id: string) {
  return useQuery({
    queryKey: ['experiment-templates', id],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('experiment_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateExperimentTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      description?: string
      content?: any
      category?: string
    }) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data: template, error } = await supabase
        .from('experiment_templates')
        .insert({
          ...data,
          created_by: user?.id,
        } as any)
        .select()
        .single()

      if (error) throw error
      return template
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiment-templates'] })
      toast.success('Template created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create template')
    },
  })
}

export function useDeleteExperimentTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()

      const { error } = await supabase
        .from('experiment_templates')
        .update({ is_active: false } as any)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiment-templates'] })
      toast.success('Template deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete template')
    },
  })
}

export function useCreateExperimentFromTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      templateId,
      name,
      studyId
    }: {
      templateId: string
      name: string
      studyId: string
    }) => {
      const supabase = createClient()

      // Get template
      const { data: template, error: templateError } = await supabase
        .from('experiment_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (templateError) throw templateError

      // Create experiment
      const { data: experiment, error } = await supabase
        .from('experiments')
        .insert({
          name,
          study_id: studyId,
          content: template.content,
          template_id: templateId,
          status: 'configuring',
        } as any)
        .select()
        .single()

      if (error) throw error
      return experiment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] })
      toast.success('Experiment created from template')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create experiment')
    },
  })
}
