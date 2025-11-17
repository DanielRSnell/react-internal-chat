import { motion } from 'framer-motion'
import { User, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { markdownToHtml } from '@/lib/markdown'
import type { Message } from '@/lib/supabase'

interface ChatMessageProps {
  message: Message
  isChainOfThought?: boolean
  isFirstInGroup?: boolean
  isLastInGroup?: boolean
}

export function ChatMessage({
  message,
  isChainOfThought = false,
  isFirstInGroup = false,
  isLastInGroup = false,
}: ChatMessageProps) {
  const isUser = message.role === 'user'
  const timestamp = new Date(message.created_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  // Convert markdown to HTML if content_html is not provided
  const htmlContent = message.content_html || markdownToHtml(message.content)

  if (isUser) {
    // User message: bubble on the right
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-end px-4 py-3"
      >
        <div className="flex max-w-[70%] flex-col items-end gap-2">
          <div className="rounded-3xl bg-neutral-100/50 px-5 py-3 text-neutral-900 dark:bg-neutral-800/50 dark:text-neutral-100">
            <p className="whitespace-pre-wrap break-words text-[15px]">{message.content}</p>
          </div>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{timestamp}</span>
        </div>
      </motion.div>
    )
  }

  // Chain-of-thought message: compact style without icon/header
  if (isChainOfThought) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="py-2"
      >
        <div className="relative rounded-lg bg-amber-50/50 px-4 py-3 dark:bg-amber-900/10">
          <div
            className="prose prose-sm max-w-none text-sm text-neutral-700 dark:prose-invert dark:text-neutral-300 prose-headings:text-sm prose-headings:font-medium prose-p:my-1 prose-a:text-amber-700 dark:prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline prose-pre:bg-amber-100 dark:prose-pre:bg-amber-900/20 prose-pre:text-neutral-800 dark:prose-pre:text-neutral-200 prose-code:text-neutral-800 dark:prose-code:text-neutral-200"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </motion.div>
    )
  }

  // Agent message: full width with icon on the left
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group flex gap-4 px-4 py-6"
    >
      <div className="flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          <Bot className="h-4 w-4" />
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Assistant</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{timestamp}</span>
        </div>

        <div
          className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-neutral-900 dark:prose-a:text-neutral-100 prose-a:no-underline hover:prose-a:underline prose-pre:bg-neutral-200 dark:prose-pre:bg-neutral-800 prose-pre:text-neutral-900 dark:prose-pre:text-neutral-100 prose-code:text-neutral-900 dark:prose-code:text-neutral-100"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </motion.div>
  )
}