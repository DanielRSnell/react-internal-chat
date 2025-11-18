import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // On success, auth state change will automatically redirect
  }

  return (
    <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md px-6"
      >
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100">
              <svg
                className="h-8 w-8 text-white dark:text-neutral-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Sign in to continue to your chat sessions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-900 dark:bg-red-900/10 dark:text-red-400"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-500 transition-colors focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-400 dark:focus:border-neutral-100 dark:focus:ring-neutral-100/10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-500 transition-colors focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-400 dark:focus:border-neutral-100 dark:focus:ring-neutral-100/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus:ring-neutral-100"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
          Access is invite-only. Contact your administrator for an account.
        </p>
      </motion.div>
    </div>
  )
}
