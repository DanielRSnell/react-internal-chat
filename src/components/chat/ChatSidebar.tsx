import { Plus, MessageSquare, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Session } from '@/lib/supabase'

interface ChatSidebarProps {
  sessions: Session[]
  activeSessionId: string | null
  onNewChat: () => void
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}: ChatSidebarProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex h-full w-full flex-col border-r border-neutral-200 bg-neutral-100/50 md:w-80 dark:border-neutral-800 dark:bg-neutral-900/50">
      {/* Header */}
      <div className="border-b border-neutral-200 p-4 pt-20 md:pt-4 dark:border-neutral-800">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4 text-center">
            <div>
              <MessageSquare className="mx-auto h-8 w-8 text-neutral-500 dark:text-neutral-400" />
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">No conversations yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group relative"
              >
                <button
                  onClick={() => onSelectSession(session.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                    activeSessionId === session.id
                      ? 'bg-white shadow-sm dark:bg-neutral-950'
                      : 'hover:bg-white/50 dark:hover:bg-neutral-950/50'
                  )}
                >
                  <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-500 dark:text-neutral-400" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{session.title}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatDate(session.updated_at)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSession(session.id)
                    }}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4 text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-500" />
                  </button>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
