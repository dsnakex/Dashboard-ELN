'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useFiles, useUploadFile, useDeleteFile } from '@/lib/hooks/use-files'
import { formatRelativeDate } from '@/lib/utils/format'
import {
  Upload,
  Search,
  Loader2,
  FileText,
  Image,
  File,
  Trash2,
  Download
} from 'lucide-react'

function getFileIcon(mimeType: string) {
  if (mimeType?.startsWith('image/')) return Image
  if (mimeType?.includes('pdf')) return FileText
  return File
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FilesPage() {
  const [search, setSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: files, isLoading } = useFiles({ search: search || undefined })
  const uploadFile = useUploadFile()
  const deleteFile = useDeleteFile()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadFile.mutateAsync({ file })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      await deleteFile.mutateAsync(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Files</h1>
          <p className="text-muted-foreground">
            {files?.length || 0} files
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadFile.isPending}
          >
            {uploadFile.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload File
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Files */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !files || files.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {search ? 'No files match your search' : 'No files yet. Upload your first file.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file: any) => {
            const FileIcon = getFileIcon(file.mime_type)

            return (
              <Card key={file.id} className="group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate" title={file.name}>
                        {file.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.file_size || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeDate(file.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
