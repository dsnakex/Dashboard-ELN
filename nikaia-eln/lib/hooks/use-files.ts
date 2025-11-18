'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export function useFiles(options?: {
  entityType?: string
  entityId?: string
  folder?: string
  search?: string
}) {
  const { entityType, entityId, folder, search } = options || {}

  return useQuery({
    queryKey: ['files', { entityType, entityId, folder, search }],
    queryFn: async () => {
      const supabase = createClient()

      let query = supabase
        .from('files')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (entityType) query = query.eq('entity_type', entityType)
      if (entityId) query = query.eq('entity_id', entityId)
      if (folder) query = query.eq('folder_path', folder)
      if (search) query = query.ilike('name', `%${search}%`)

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useUploadFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      file,
      entityType,
      entityId,
      folder = '/'
    }: {
      file: File
      entityType?: string
      entityId?: string
      folder?: string
    }) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // Upload to storage
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `uploads/${user?.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Create file record
      const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .insert({
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          folder_path: folder,
          entity_type: entityType,
          entity_id: entityId,
          uploaded_by: user?.id,
        } as any)
        .select()
        .single()

      if (dbError) throw dbError
      return fileRecord
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      toast.success('File uploaded successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload file')
    },
  })
}

export function useDeleteFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()

      // Get file record
      const { data: file, error: fetchError } = await supabase
        .from('files')
        .select('file_path')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Delete from storage
      if (file?.file_path) {
        await supabase.storage.from('files').remove([file.file_path])
      }

      // Delete record
      const { error } = await supabase
        .from('files')
        .update({ is_active: false } as any)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      toast.success('File deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete file')
    },
  })
}
