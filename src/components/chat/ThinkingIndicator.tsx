import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const THINKING_MESSAGES = [
  'Frolicking',
  'Meandering',
  'Pondering',
  'Contemplating',
  'Musing',
  'Ruminating',
  'Cogitating',
  'Deliberating',
  'Wandering',
  'Exploring',
  'Discovering',
  'Unraveling',
  'Deciphering',
  'Analyzing',
  'Synthesizing',
  'Connecting dots',
  'Following threads',
  'Diving deep',
  'Brewing ideas',
  'Crafting thoughts',
  'Weaving answers',
  'Gathering insights',
  'Piecing together',
  'Untangling',
  'Percolating',
  'Marinating',
  'Simmering',
  'Incubating',
  'Crystallizing',
  'Formulating',
  'Assembling',
  'Orchestrating',
  'Composing',
  'Constructing',
  'Architecting',
  'Brainstorming',
  'Ideating',
  'Conjuring',
  'Summoning wisdom',
  'Channeling creativity',
]

export function ThinkingIndicator() {
  const [currentMessage, setCurrentMessage] = useState(
    THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)])
    }, 2000) // Change message every 2 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="group flex gap-4 px-4 py-6 bg-neutral-100/50 dark:bg-neutral-900/50"
    >
      <div className="flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          <Bot className="h-4 w-4" />
        </div>
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Assistant</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentMessage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-neutral-500 dark:text-neutral-400"
            >
              {currentMessage}...
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <div className="flex gap-1">
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            >
              •
            </motion.span>
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            >
              •
            </motion.span>
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            >
              •
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
