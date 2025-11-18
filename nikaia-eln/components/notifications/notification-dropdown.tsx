'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead
} from '@/lib/hooks/use-notifications'
import { formatRelativeDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import {
  Bell,
  FlaskConical,
  CheckCircle,
  AlertCircle,
  Info,
  X
} from 'lucide-react'

const typeIcons: Record<string, React.ElementType> = {
  experiment_completed: CheckCircle,
  experiment_signed: FlaskConical,
  error: AlertCircle,
  info: Info,
}

const typeColors: Record<string, string> = {
  experiment_completed: 'text-green-500',
  experiment_signed: 'text-purple-500',
  error: 'text-red-500',
  info: 'text-blue-500',
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const { data: notifications } = useNotifications()
  const { data: unreadCount } = useUnreadNotificationCount()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const handleMarkRead = (id: string) => {
    markRead.mutate(id)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold">Notifications</h3>
              {notifications && notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllRead.mutate()}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {!notifications || notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notif: any) => {
                  const Icon = typeIcons[notif.type] || Info
                  const color = typeColors[notif.type] || 'text-muted-foreground'

                  return (
                    <div
                      key={notif.id}
                      className={cn(
                        'flex gap-3 p-3 border-b hover:bg-muted/50 cursor-pointer',
                        !notif.is_read && 'bg-primary/5'
                      )}
                      onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                    >
                      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', color)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notif.title}</p>
                        {notif.message && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notif.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatRelativeDate(notif.created_at)}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
