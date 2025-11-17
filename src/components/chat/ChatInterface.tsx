import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { ChatSidebar } from './ChatSidebar'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'
import { supabase, type Session, type Message } from '@/lib/supabase'
import { sendToWebhook } from '@/services/webhookService'

export function ChatInterface() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  // Load sessions on mount
  useEffect(() => {
    loadSessions()
  }, [])

  // Load messages when active session changes
  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId)
      subscribeToMessages(activeSessionId)
    } else {
      setMessages([])
    }
  }, [activeSessionId])

  // Subscribe to session updates
  useEffect(() => {
    const channel = supabase
      .channel('sessions-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => {
        loadSessions()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Manage loading state based on messages
  useEffect(() => {
    if (messages.length === 0) return

    const lastMessage = messages[messages.length - 1]

    // If last message is from user, keep loading (waiting for agent response)
    if (lastMessage.role === 'user') {
      setLoading(true)
    }

    // If last message is from agent, stop loading
    if (lastMessage.role === 'agent') {
      setLoading(false)
    }
  }, [messages])

  const loadSessions = async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error loading sessions:', error)
      return
    }

    setSessions(data || [])

    // If no active session and we have sessions, select the first one
    if (!activeSessionId && data && data.length > 0) {
      setActiveSessionId(data[0].id)
    }
  }

  const loadMessages = async (sessionId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading messages:', error)
      return
    }

    setMessages(data || [])
  }

  const subscribeToMessages = (sessionId: string) => {
    const channel = supabase
      .channel(`messages-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new as Message])
          setLoading(false)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleNewChat = async () => {
    const { data, error } = await supabase.from('sessions').insert({ title: 'New Chat' }).select().single()

    if (error) {
      console.error('Error creating session:', error)
      return
    }

    setActiveSessionId(data.id)
    await loadSessions()
  }

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId)
    setIsMobileDrawerOpen(false) // Close drawer on mobile when session is selected
  }

  const handleDeleteSession = async (sessionId: string) => {
    const { error } = await supabase.from('sessions').delete().eq('id', sessionId)

    if (error) {
      console.error('Error deleting session:', error)
      return
    }

    // If we deleted the active session, clear it
    if (sessionId === activeSessionId) {
      setActiveSessionId(null)
    }

    await loadSessions()
  }

  const handleSendMessage = async (content: string) => {
    let sessionId = activeSessionId
    let isNewSession = false

    // Create a new session if none exists
    if (!sessionId) {
      // Truncate to 40 characters for better sidebar display
      const title = content.length > 40 ? content.slice(0, 40) + '...' : content

      const { data, error } = await supabase.from('sessions').insert({ title }).select().single()

      if (error) {
        console.error('Error creating session:', error)
        return
      }

      sessionId = data.id
      setActiveSessionId(sessionId)
      isNewSession = true
    }

    // Update session title if it's still "New Chat" (for sessions created by "New Chat" button)
    if (!isNewSession) {
      const currentSession = sessions.find((s) => s.id === sessionId)
      if (currentSession?.title === 'New Chat' && messages.length === 0) {
        // Truncate to 40 characters for better sidebar display
        const title = content.length > 40 ? content.slice(0, 40) + '...' : content
        await supabase.from('sessions').update({ title }).eq('id', sessionId)
      }
    }

    // Show loading state
    setLoading(true)

    // Send to N8N webhook - N8N will handle inserting messages to Supabase
    try {
      await sendToWebhook(sessionId!, content)
    } catch (error) {
      console.error('Error sending to webhook:', error)
      setLoading(false)
    }

    // Reload sessions to get the updated list
    if (isNewSession) {
      await loadSessions()
    }
  }

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar - Always visible on md+ screens */}
      <div className="hidden md:block">
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
        />
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileDrawerOpen(true)}
        className="fixed right-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 z-[100] bg-black/50 md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-0 z-[101] bg-white dark:bg-neutral-950 md:hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>

              <ChatSidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onNewChat={handleNewChat}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col">
        <ChatMessages messages={messages} loading={loading} />
        <ChatInput onSend={handleSendMessage} disabled={loading} />
      </div>
    </div>
  )
}
