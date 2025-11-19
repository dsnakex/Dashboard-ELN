'use client'

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Task, useUpdateTask } from '@/lib/hooks/use-tasks'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Calendar, Flag, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils/cn'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'review', title: 'Review', color: 'bg-amber-500' },
  { id: 'done', title: 'Done', color: 'bg-green-500' },
]

const PRIORITY_COLORS = {
  low: 'text-slate-500',
  medium: 'text-amber-500',
  high: 'text-red-500',
}

export function KanbanBoard({ tasks, onTaskClick }: KanbanBoardProps) {
  const updateTask = useUpdateTask()

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const taskId = result.draggableId
    const newStatus = result.destination.droppableId as Task['status']

    // Optimistic update already handled by react-query
    updateTask.mutate({ id: taskId, status: newStatus })
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
        {COLUMNS.map(column => (
          <div key={column.id} className="flex flex-col">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3">
              <div className={cn('w-3 h-3 rounded-full', column.color)} />
              <h3 className="font-medium">{column.title}</h3>
              <Badge variant="secondary" className="ml-auto">
                {getTasksByStatus(column.id).length}
              </Badge>
            </div>

            {/* Droppable area */}
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    'flex-1 space-y-2 p-2 rounded-lg min-h-[200px] transition-colors',
                    snapshot.isDraggingOver ? 'bg-muted/80' : 'bg-muted/30'
                  )}
                >
                  {getTasksByStatus(column.id).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => onTaskClick(task)}
                          className={cn(
                            'p-3 cursor-pointer hover:shadow-md transition-shadow',
                            snapshot.isDragging && 'shadow-lg rotate-2'
                          )}
                        >
                          {/* Task title */}
                          <p className="font-medium text-sm mb-2">{task.title}</p>

                          {/* Task meta */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {/* Priority */}
                            <Flag className={cn('h-3 w-3', PRIORITY_COLORS[task.priority])} />

                            {/* Due date */}
                            {task.due_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                              </span>
                            )}

                            {/* Project */}
                            {task.project && (
                              <Badge variant="outline" className="text-xs">
                                {task.project.name}
                              </Badge>
                            )}
                          </div>

                          {/* Assignee */}
                          {task.assignee && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={task.assignee.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {task.assignee.full_name?.[0] || task.assignee.email[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground truncate">
                                {task.assignee.full_name || task.assignee.email}
                              </span>
                            </div>
                          )}
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
