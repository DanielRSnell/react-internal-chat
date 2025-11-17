import { useEffect, useRef, useMemo } from 'react'
import { ChatMessage } from './ChatMessage'
import { ThinkingIndicator } from './ThinkingIndicator'
import type { Message } from '@/lib/supabase'

interface ChatMessagesProps {
  messages: Message[]
  loading?: boolean
}

interface MessageGroup {
  type: 'user' | 'agent' | 'chain-of-thought'
  messages: Message[]
}

export function ChatMessages({ messages, loading = false }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Group messages for chain-of-thought display
  const messageGroups = useMemo((): MessageGroup[] => {
    const groups: MessageGroup[] = []
    let currentChainGroup: Message[] = []

    messages.forEach((message, index) => {
      if (message.role === 'user') {
        // Flush any pending chain-of-thought group
        if (currentChainGroup.length > 0) {
          groups.push({ type: 'chain-of-thought', messages: currentChainGroup })
          currentChainGroup = []
        }
        groups.push({ type: 'user', messages: [message] })
      } else if (message.role === 'agent') {
        if (message.final === false) {
          // Add to chain-of-thought group
          currentChainGroup.push(message)
        } else {
          // Flush any pending chain-of-thought group
          if (currentChainGroup.length > 0) {
            groups.push({ type: 'chain-of-thought', messages: currentChainGroup })
            currentChainGroup = []
          }
          groups.push({ type: 'agent', messages: [message] })
        }
      }
    })

    // Flush any remaining chain-of-thought group
    if (currentChainGroup.length > 0) {
      groups.push({ type: 'chain-of-thought', messages: currentChainGroup })
    }

    return groups
  }, [messages])

  // Check if the last message has final: false (agent is still thinking)
  const isThinking = useMemo(() => {
    if (messages.length === 0) return false
    const lastMessage = messages[messages.length - 1]
    return lastMessage.role === 'agent' && lastMessage.final === false
  }, [messages])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages.length, isThinking])

  // Smooth scroll when prose content updates (streaming animation)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth',
        })
      }
    })

    if (containerRef.current) {
      // Observe all prose elements for content changes
      const proseElements = containerRef.current.querySelectorAll('.prose')
      proseElements.forEach((element) => {
        observer.observe(element, {
          childList: true,
          subtree: true,
          characterData: true,
        })
      })
    }

    return () => observer.disconnect()
  }, [messages])

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800">
              <svg
                className="h-8 w-8 text-neutral-600 dark:text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold">Start a conversation</h3>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Send a message to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl">
        {messageGroups.map((group, groupIndex) => {
          if (group.type === 'user') {
            return <ChatMessage key={group.messages[0].id} message={group.messages[0]} />
          }

          if (group.type === 'agent') {
            return <ChatMessage key={group.messages[0].id} message={group.messages[0]} />
          }

          // Chain-of-thought group
          return (
            <div key={`chain-${groupIndex}`} className="group flex gap-4 px-4 py-6">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex-1 space-y-2 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                    Chain of Thought
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {group.messages.length} step{group.messages.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2 border-l-2 border-amber-200 pl-4 dark:border-amber-800">
                  {group.messages.map((message, index) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isChainOfThought={true}
                      isFirstInGroup={index === 0}
                      isLastInGroup={index === group.messages.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        })}

        {/* Show thinking indicator if agent is thinking or waiting for first response */}
        {(isThinking || loading) && <ThinkingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
