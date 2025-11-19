'use client'

import { useState } from 'react'
import { useComments, useCreateComment, useDeleteComment } from '@/lib/hooks/use-comments'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare, Send, Trash2, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface CommentsSectionProps {
  entityType: string
  entityId: string
}

export function CommentsSection({ entityType, entityId }: CommentsSectionProps) {
  const { user } = useAuthStore()
  const { data: comments, isLoading } = useComments(entityType, entityId)
  const createComment = useCreateComment()
  const deleteComment = useDeleteComment()

  const [newComment, setNewComment] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await createComment.mutateAsync({
        entityType,
        entityId,
        content: newComment.trim(),
      })
      setNewComment('')
    } catch (error) {
      console.error('Failed to create comment:', error)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await deleteComment.mutateAsync({
        id: commentId,
        entityType,
        entityId,
      })
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments
          {comments && comments.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({comments.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!newComment.trim() || createComment.isPending}
              size="sm"
            >
              {createComment.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Post Comment
            </Button>
          </div>
        </form>

        {/* Comments list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-4 pt-4 border-t">
            {comments.map((comment: any) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {comment.user?.full_name?.[0] || comment.user?.email?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {comment.user?.full_name || comment.user?.email || 'Unknown'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                      {comment.updated_at !== comment.created_at && (
                        <span className="text-xs text-muted-foreground">(edited)</span>
                      )}
                    </div>
                    {comment.user_id === user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDelete(comment.id)}
                        disabled={deleteComment.isPending}
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
