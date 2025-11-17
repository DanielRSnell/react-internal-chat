import { useState, useRef, KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { Send, Mic, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled = false, placeholder = 'Send a message...' }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextareaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget
    target.style.height = 'auto'
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`
  }

  return (
    <div className="bg-white p-4 dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl">
        <div className="relative rounded-3xl border border-neutral-300 bg-white shadow-sm focus-within:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:focus-within:border-neutral-600">
          <button
            type="button"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <Plus className="h-5 w-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'max-h-[200px] min-h-[24px] w-full resize-none bg-transparent px-14 py-3 text-[15px] outline-none placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-neutral-400 mt-[0.35rem]',
              'scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent dark:scrollbar-thumb-neutral-800'
            )}
          />

          {message.trim() ? (
            <motion.button
              onClick={handleSubmit}
              disabled={disabled}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-900 text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              whileTap={{ scale: 0.95 }}
            >
              <Send className="h-4 w-4" />
            </motion.button>
          ) : (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mt-2 px-3 text-center text-xs text-neutral-500 dark:text-neutral-400">
          Press <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">Enter</kbd> to send, <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">Shift + Enter</kbd> for new line
        </div>
      </div>
    </div>
  )
}
